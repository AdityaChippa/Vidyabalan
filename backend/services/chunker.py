import re
import fitz

def detect_chapters_from_toc(pdf_bytes):
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
        entries_a, entries_b = [], []
        for line in lines:
            s = line.strip()
            m = re.match(r'^(\d+)\.\s*\t\s*(.+?)\.{2,}\s*(\d+)\s*$', s)
            if not m: m = re.match(r'^(\d+)\.\s+(.+?)\.{2,}\s*(\d+)\s*$', s)
            if not m: m = re.match(r'^(\d+)\.\s+(.{5,}?)\s{3,}(\d+)\s*$', s)
            if m: entries_a.append((int(m.group(1)), m.group(2).strip(), int(m.group(3))))
        j = 0
        while j < len(lines):
            s = lines[j].strip()
            nm = re.match(r'^(\d+)\.\s*\t?\s*$', s)
            if nm and j+1 < len(lines):
                ns = lines[j+1].strip()
                tm = re.match(r'^(.+?)\.{2,}\s*(\d+)\s*$', ns)
                if not tm: tm = re.match(r'^(.+?)\s{3,}(\d+)\s*$', ns)
                if tm:
                    entries_b.append((int(nm.group(1)), tm.group(1).strip(), int(tm.group(2))))
                    j += 2; continue
            j += 1
        if i+1 < total:
            for line in doc[i+1].get_text("text").strip().split('\n'):
                s = line.strip()
                m = re.match(r'^(\d+)\.\s*\t\s*(.+?)\.{2,}\s*(\d+)\s*$', s)
                if not m: m = re.match(r'^(\d+)\.\s+(.+?)\.{2,}\s*(\d+)\s*$', s)
                if m: entries_a.append((int(m.group(1)), m.group(2).strip(), int(m.group(3))))
        seen = {}
        for n,t,p in entries_b + entries_a:
            if n not in seen or len(t) > len(seen[n][1]): seen[n] = (n,t,p)
        ents = sorted(seen.values(), key=lambda x: x[0])
        if len(ents) < 2:
            print(f"[TOC] Only {len(ents)} entries, skipping")
            doc.close(); return []
        fp = ents[0][2]; offset = 0
        for j in range(max(0,i-2), min(total, i+20)):
            pt = doc[j].get_text("text").strip()
            if not pt: continue
            fl = pt.split('\n')[0].strip(); ll = pt.split('\n')[-1].strip()
            if fl == str(fp) or ll == str(fp):
                offset = (j+1) - fp
                print(f"[TOC] Offset={offset} ('{fp}' on PDF page {j+1})")
                break
        if offset == 0:
            offset = i + 1
            print(f"[TOC] Offset={offset} (fallback)")
        chs = []
        for idx,(n,t,pp) in enumerate(ents):
            ps = pp+offset; pe = (ents[idx+1][2]+offset-1) if idx+1<len(ents) else total
            ps = max(1,min(ps,total)); pe = max(ps,min(pe,total))
            chs.append({"chapter_number":n,"title":t,"page_start":ps,"page_end":pe})
        print(f"[TOC] {len(chs)} chapters detected")
        for c in chs:
            print(f"[TOC]   Ch {c['chapter_number']}: {c['title'][:40]} pp.{c['page_start']}-{c['page_end']}")
        doc.close(); return chs
    doc.close()
    print("[TOC] No TOC found")
    return []

def detect_chapters(pages, pdf_bytes=None):
    if pdf_bytes:
        toc = detect_chapters_from_toc(pdf_bytes)
        if toc: return toc
    chapters = []
    pats = [r"(?i)^chapter\s+(\d+)\s*[:\-\u2013\u2014.]?\s*(.*)", r"(?i)^unit\s+(\d+)\s*[:\-\u2013\u2014.]?\s*(.*)", r"(?i)^lesson\s+(\d+)\s*[:\-\u2013\u2014.]?\s*(.*)", r"(?i)^(\d+)\.\s+([A-Z][a-zA-Z\s,&]+)", r"(?i)^CHAPTER\s+(\d+)\s*$"]
    for page in pages:
        text = page.get("text","")
        if not text: continue
        pl = text.split("\n")
        for line in pl[:15]:
            line = line.strip()
            if not line or len(line)>200: continue
            for pat in pats:
                match = re.match(pat, line)
                if match:
                    cn = int(match.group(1)); t = match.group(2).strip() if match.lastindex>=2 and match.group(2) else ""
                    t = re.sub(r"\s+"," ",t)[:150]
                    if not t: t = f"Chapter {cn}"
                    if not any(c["chapter_number"]==cn for c in chapters):
                        chapters.append({"chapter_number":cn,"title":t,"page_start":page["page_number"]})
                    break
    if not chapters:
        tot = len(pages); pc = max(10, tot//10)
        for idx in range(0,tot,pc):
            cn = (idx//pc)+1; ft = pages[idx]["text"] if idx<len(pages) else ""
            hl = [l.strip() for l in ft.split("\n")[:5] if l.strip() and len(l.strip())>3]
            chapters.append({"chapter_number":cn,"title":hl[0][:80] if hl else f"Section {cn}","page_start":idx+1})
    chapters.sort(key=lambda c: c["chapter_number"])
    for idx in range(len(chapters)):
        chapters[idx]["page_end"] = chapters[idx+1]["page_start"]-1 if idx+1<len(chapters) else len(pages)
    return chapters

def chunk_text(pages, chapters, chunk_size=400):
    chunks = []; ci = 0
    for ch in chapters:
        s,e = ch["page_start"], ch["page_end"]
        ct = "".join(p["text"]+"\n\n" for p in pages if s<=p["page_number"]<=e)
        words = ct.split()
        if not words: continue
        cw = []
        for wi,w in enumerate(words):
            cw.append(w)
            if len(cw)>=chunk_size:
                ep = s+int((wi/len(words))*(e-s))
                chunks.append({"content":" ".join(cw),"chapter_number":ch["chapter_number"],"chapter_title":ch["title"],"page_number":ep,"chunk_index":ci})
                ci+=1; cw=[]
        if cw:
            chunks.append({"content":" ".join(cw),"chapter_number":ch["chapter_number"],"chapter_title":ch["title"],"page_number":e,"chunk_index":ci})
            ci+=1
    return chunks

def estimate_read_time(pc): return max(5, pc*3)

def extract_topics(text, mt=4):
    sents = re.split(r'[.!?\u0964]+', text); topics, seen = [], set()
    for s in sents:
        s = s.strip()
        if 3<=len(s.split())<=12:
            k = s.lower()
            if k not in seen: seen.add(k); topics.append(s[:60])
            if len(topics)>=mt: break
    if not topics:
        w = text.split()[:50]; topics = [" ".join(w[:8])] if w else ["General content"]
    return topics[:mt]
