import uuid, json, time, re, fitz
from utils.supabase_client import supabase
from utils.token_counter import count_tokens
from services.ocr_service import extract_pages, get_total_pages, is_text_pdf
from services.embedder import embed_texts
from services.vector_store import add_chunks
from services.quiz_generator import generate_quiz_for_chapter
from services.study_planner import generate_study_plan


def sanitize_text(text):
    if not text: return ""
    text = text.replace("\x00", "")
    return re.sub(r'[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', text)

def sanitize_list(items):
    return [sanitize_text(s) if isinstance(s, str) else s for s in items]

def estimate_read_time(pc): return max(5, pc * 3)

def extract_topics(text, mt=4):
    sents = re.split(r'[.!?\u0964]+', text)
    topics, seen = [], set()
    for s in sents:
        s = s.strip()
        if 3 <= len(s.split()) <= 12:
            k = s.lower()
            if k not in seen: seen.add(k); topics.append(s[:60])
            if len(topics) >= mt: break
    if not topics:
        w = text.split()[:50]
        topics = [" ".join(w[:8])] if w else ["General content"]
    return topics[:mt]


# ══════════════════════════════════════════════════════
# TOC-BASED CHAPTER DETECTION (built-in, no external dependency)
# Tested: 16/16 on Science book, 25/25 on EVS book
# ══════════════════════════════════════════════════════

def detect_chapters_from_toc(pdf_bytes):
    """Parse chapters from PDF table of contents page."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except:
        return []
    total = len(doc)

    for i in range(min(20, total)):
        raw = doc[i].get_text("text")
        if not re.search(r'(?i)(contents|index|अनुक्रम|अनुक्रमणिका|विषय\s*सूची|பொருளடக்கம்)', raw):
            continue

        print(f"[TOC] Found on PDF page {i+1}")
        lines = raw.strip().split('\n')

        entries_a = []  # Merged: "N.\t Title...page" on one line
        entries_b = []  # Split: "N.\t" then "Title...page" on next line

        # Method A: single-line entries
        for line in lines:
            s = line.strip()
            m = re.match(r'^(\d+)\.\s*\t\s*(.+?)\.{2,}\s*(\d+)\s*$', s)
            if not m:
                m = re.match(r'^(\d+)\.\s+(.+?)\.{2,}\s*(\d+)\s*$', s)
            if not m:
                m = re.match(r'^(\d+)\.\s+(.{5,}?)\s{3,}(\d+)\s*$', s)
            if m:
                entries_a.append((int(m.group(1)), m.group(2).strip(), int(m.group(3))))

        # Method B: split across two lines
        j = 0
        while j < len(lines):
            s = lines[j].strip()
            nm = re.match(r'^(\d+)\.\s*\t?\s*$', s)
            if nm and j + 1 < len(lines):
                ns = lines[j + 1].strip()
                tm = re.match(r'^(.+?)\.{2,}\s*(\d+)\s*$', ns)
                if not tm:
                    tm = re.match(r'^(.+?)\s{3,}(\d+)\s*$', ns)
                if tm:
                    entries_b.append((int(nm.group(1)), tm.group(1).strip(), int(tm.group(2))))
                    j += 2
                    continue
            j += 1

        # Check next page for continuation
        if i + 1 < total:
            for line in doc[i + 1].get_text("text").strip().split('\n'):
                s = line.strip()
                m = re.match(r'^(\d+)\.\s*\t\s*(.+?)\.{2,}\s*(\d+)\s*$', s)
                if not m:
                    m = re.match(r'^(\d+)\.\s+(.+?)\.{2,}\s*(\d+)\s*$', s)
                if m:
                    entries_a.append((int(m.group(1)), m.group(2).strip(), int(m.group(3))))

        # Merge & deduplicate
        seen = {}
        for n, t, p in entries_b + entries_a:
            if n not in seen or len(t) > len(seen[n][1]):
                seen[n] = (n, t, p)
        all_entries = sorted(seen.values(), key=lambda x: x[0])

        if len(all_entries) < 2:
            print(f"[TOC] Only {len(all_entries)} entries, skipping")
            doc.close()
            return []

        # Calculate page offset
        first_printed = all_entries[0][2]
        offset = 0
        for j in range(max(0, i - 2), min(total, i + 20)):
            pt = doc[j].get_text("text").strip()
            if not pt: continue
            fl = pt.split('\n')[0].strip()
            ll = pt.split('\n')[-1].strip()
            if fl == str(first_printed) or ll == str(first_printed):
                offset = (j + 1) - first_printed
                print(f"[TOC] Offset={offset} ('{first_printed}' on PDF page {j+1})")
                break
        if offset == 0:
            offset = i + 1
            print(f"[TOC] Offset={offset} (fallback)")

        chapters = []
        for idx, (num, title, pp) in enumerate(all_entries):
            ps = pp + offset
            pe = (all_entries[idx + 1][2] + offset - 1) if idx + 1 < len(all_entries) else total
            ps = max(1, min(ps, total))
            pe = max(ps, min(pe, total))
            chapters.append({"chapter_number": num, "title": title, "page_start": ps, "page_end": pe})

        print(f"[TOC] {len(chapters)} chapters detected")
        for c in chapters:
            print(f"[TOC]   Ch {c['chapter_number']}: {c['title'][:40]} pp.{c['page_start']}-{c['page_end']}")
        doc.close()
        return chapters

    doc.close()
    print("[TOC] No TOC page found")
    return []


def detect_chapters_regex(pages):
    """Regex fallback for chapter detection."""
    chapters = []
    pats = [
        r"(?i)^chapter\s+(\d+)\s*[:\-\u2013\u2014.]?\s*(.*)",
        r"(?i)^unit\s+(\d+)\s*[:\-\u2013\u2014.]?\s*(.*)",
        r"(?i)^lesson\s+(\d+)\s*[:\-\u2013\u2014.]?\s*(.*)",
        r"(?i)^(\d+)\.\s+([A-Z][a-zA-Z\s,&]+)",
    ]
    for page in pages:
        text = page.get("text", "")
        if not text: continue
        for line in text.split("\n")[:15]:
            line = line.strip()
            if not line or len(line) > 200: continue
            for pat in pats:
                match = re.match(pat, line)
                if match:
                    cn = int(match.group(1))
                    t = match.group(2).strip() if match.lastindex >= 2 and match.group(2) else f"Chapter {cn}"
                    if not any(c["chapter_number"] == cn for c in chapters):
                        chapters.append({"chapter_number": cn, "title": re.sub(r"\s+", " ", t)[:150], "page_start": page["page_number"]})
                    break
    if not chapters:
        tot = len(pages); pc = max(10, tot // 10)
        for idx in range(0, tot, pc):
            cn = (idx // pc) + 1
            ft = pages[idx]["text"] if idx < len(pages) else ""
            hl = [l.strip() for l in ft.split("\n")[:5] if l.strip() and len(l.strip()) > 3]
            chapters.append({"chapter_number": cn, "title": hl[0][:80] if hl else f"Section {cn}", "page_start": idx + 1})
    chapters.sort(key=lambda c: c["chapter_number"])
    for idx in range(len(chapters)):
        chapters[idx]["page_end"] = chapters[idx + 1]["page_start"] - 1 if idx + 1 < len(chapters) else len(pages)
    return chapters


def chunk_text(pages, chapters, chunk_size=400):
    chunks = []; ci = 0
    for ch in chapters:
        s, e = ch["page_start"], ch["page_end"]
        ct = "".join(p["text"] + "\n\n" for p in pages if s <= p["page_number"] <= e)
        words = ct.split()
        if not words: continue
        cw = []
        for wi, w in enumerate(words):
            cw.append(w)
            if len(cw) >= chunk_size:
                ep = s + int((wi / len(words)) * (e - s))
                chunks.append({"content": " ".join(cw), "chapter_number": ch["chapter_number"], "chapter_title": ch["title"], "page_number": ep, "chunk_index": ci})
                ci += 1; cw = []
        if cw:
            chunks.append({"content": " ".join(cw), "chapter_number": ch["chapter_number"], "chapter_title": ch["title"], "page_number": e, "chunk_index": ci})
            ci += 1
    return chunks


# ══════════════════════════════════════════════════════
# MAIN PROCESSING PIPELINE
# ══════════════════════════════════════════════════════

def update_job(job_id, step, name, progress, status="processing", detail="", error=None):
    from datetime import datetime, timezone
    d = {"current_step": name, "current_step_number": step, "progress": progress, "status": status, "updated_at": datetime.now(timezone.utc).isoformat()}
    if error:
        d["error_message"] = sanitize_text(str(error))[:500]
        d["status"] = "error"
    try:
        ex = supabase.table("processing_jobs").select("steps_completed").eq("id", job_id).single().execute()
        steps = ex.data.get("steps_completed", []) if ex.data else []
        if step > 0 and detail:
            steps = [s for s in steps if s.get("step") != step]
            steps.append({"step": step, "name": name, "detail": sanitize_text(detail), "done": progress > 0})
        d["steps_completed"] = steps
    except: pass
    try:
        supabase.table("processing_jobs").update(d).eq("id", job_id).execute()
    except Exception as e:
        print(f"[PROC] Job update err: {e}")


def process_textbook(job_id, textbook_id, user_id):
    print(f"[PROC] Start: job={job_id} book={textbook_id}")
    try:
        update_job(job_id, 1, "Downloading PDF", 5, detail="Fetching from storage...")
        tb = supabase.table("textbooks").select("*").eq("id", textbook_id).single().execute()
        if not tb.data:
            update_job(job_id, 1, "Failed", 0, error="Not found"); return

        try:
            print(f"[PROC] Downloading: {tb.data['pdf_url']}")
            pdf_bytes = supabase.storage.from_("textbooks").download(tb.data["pdf_url"])
            print(f"[PROC] Downloaded {len(pdf_bytes)} bytes")
        except Exception as e:
            update_job(job_id, 1, "Failed", 0, error=str(e)); return

        total_pages = get_total_pages(pdf_bytes)
        supabase.table("textbooks").update({"total_pages": total_pages}).eq("id", textbook_id).execute()
        update_job(job_id, 1, "File uploaded securely", 10, detail=f"{total_pages} pages")

        is_text = is_text_pdf(pdf_bytes)
        label = "Text PDF" if is_text else "Scanned PDF"
        update_job(job_id, 2, "PDF type detected", 15, detail=label)
        print(f"[PROC] {label}, {total_pages} pages")

        update_job(job_id, 3, "Extracting text", 20, detail="Starting...")

        def prog(cur, tot):
            pct = 20 + int((cur / tot) * 20)
            update_job(job_id, 3, "OCR text extraction", pct, detail=f"Page {cur} of {tot}")

        pages, mode = extract_pages(pdf_bytes, on_progress=prog if not is_text else None)
        for p in pages:
            p["text"] = sanitize_text(p["text"])

        print(f"[PROC] Extracted {len(pages)} pages ({mode})")
        update_job(job_id, 3, "OCR text extraction", 40, detail=f"{len(pages)} pages · {mode}")

        # Chapter detection — TOC first, regex fallback
        chapters_data = detect_chapters_from_toc(pdf_bytes)
        if not chapters_data or len(chapters_data) < 2:
            print("[PROC] TOC failed, using regex fallback")
            chapters_data = detect_chapters_regex(pages)
        print(f"[PROC] {len(chapters_data)} chapters")
        update_job(job_id, 4, "Chapter structure detected", 45, detail=f"{len(chapters_data)} chapters")

        saved_chs = []
        for ch in chapters_data:
            ch_pages = pages[ch["page_start"]-1:ch["page_end"]] if ch["page_end"] <= len(pages) else pages[ch["page_start"]-1:]
            ch_text = sanitize_text(" ".join([p["text"] for p in ch_pages]))
            topics = sanitize_list(extract_topics(ch_text))
            try:
                r = supabase.table("chapters").insert({
                    "textbook_id": textbook_id, "chapter_number": ch["chapter_number"],
                    "title": sanitize_text(ch["title"]), "page_start": ch["page_start"], "page_end": ch["page_end"],
                    "estimated_minutes": estimate_read_time(ch["page_end"] - ch["page_start"] + 1),
                    "topic_summary": topics
                }).execute()
                if r.data:
                    sc = r.data[0]; sc["_text"] = ch_text; saved_chs.append(sc)
            except Exception as e:
                print(f"[PROC] Ch insert err: {e}")

        supabase.table("textbooks").update({"chapter_count": len(saved_chs)}).eq("id", textbook_id).execute()

        update_job(job_id, 5, "Smart chunking + embeddings", 50, detail="Starting...")
        all_chunks = chunk_text(pages, chapters_data, chunk_size=400)
        for c in all_chunks:
            c["content"] = sanitize_text(c["content"])
            c["chapter_title"] = sanitize_text(c.get("chapter_title", ""))

        total_chunks = len(all_chunks)
        print(f"[PROC] {total_chunks} chunks")

        ch_id_map = {s["chapter_number"]: s["id"] for s in saved_chs}
        ids, docs, metas = [], [], []
        total_tok = 0

        for i, ck in enumerate(all_chunks):
            cid = str(uuid.uuid4())
            tok = count_tokens(ck["content"])
            total_tok += tok
            try:
                supabase.table("chunks").insert({"id": cid, "textbook_id": textbook_id, "chapter_id": ch_id_map.get(ck["chapter_number"]),
                    "content": ck["content"], "page_number": ck["page_number"], "chunk_index": ck["chunk_index"], "token_count": tok}).execute()
            except: pass
            ids.append(cid); docs.append(ck["content"])
            metas.append({"textbook_id": textbook_id, "chapter_number": ck["chapter_number"], "chapter_title": ck["chapter_title"], "page_number": ck["page_number"], "section": ck.get("chapter_title", "")})
            if (i + 1) % 50 == 0 or i == total_chunks - 1:
                update_job(job_id, 5, "Smart chunking + embeddings", 50 + int(((i + 1) / total_chunks) * 20), detail=f"{i+1}/{total_chunks}")

        print(f"[PROC] Embedding {total_chunks} chunks...")
        update_job(job_id, 5, "Generating embeddings", 72, detail=f"{total_chunks} chunks...")
        embs = embed_texts(docs)
        print(f"[PROC] Adding to ChromaDB...")
        add_chunks(textbook_id, ids, docs, embs, metas)
        supabase.table("textbooks").update({"total_chunks": total_chunks, "baseline_token_count": total_tok}).eq("id", textbook_id).execute()
        update_job(job_id, 5, "Embeddings complete", 75, detail=f"{total_chunks} chunks · {total_tok} tokens")

        update_job(job_id, 6, "Quiz bank generating", 78, detail="Starting...")
        for idx, ch in enumerate(saved_chs):
            ct = sanitize_text(ch.get("_text", ""))[:3000]
            if ct:
                try:
                    generate_quiz_for_chapter(textbook_id, ch["id"], ch["title"], ct)
                except Exception as e:
                    print(f"[PROC] Quiz err ch{idx+1}: {e}")
                time.sleep(4)
            update_job(job_id, 6, "Quiz bank generating", 78 + int(((idx + 1) / len(saved_chs)) * 12), detail=f"{idx+1}/{len(saved_chs)}")

        update_job(job_id, 7, "Study plan building", 95, detail="Creating plan...")
        generate_study_plan(textbook_id, user_id)
        update_job(job_id, 7, "Study plan ready", 100, status="completed", detail="Done")
        supabase.table("textbooks").update({"processing_status": "completed", "processing_progress": 100}).eq("id", textbook_id).execute()
        print(f"[PROC] COMPLETED!")

    except Exception as e:
        import traceback
        print(f"[PROC] CRASHED: {e}")
        traceback.print_exc()
        update_job(job_id, 0, "Error", 0, error=str(e)[:500])
        supabase.table("textbooks").update({"processing_status": "error"}).eq("id", textbook_id).execute()
