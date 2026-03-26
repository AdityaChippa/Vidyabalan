import json, os, time
from services.embedder import embed_text
from services.vector_store import query_chunks, get_all_documents
from services.groq_client import get_client, stream_chat, FALLBACK, PRIMARY
from utils.token_counter import count_tokens
from utils.cost_calculator import calculate_cost_inr
from utils.supabase_client import supabase

LANGUAGE_MAP = {"en":"English","hi":"Hindi (हिन्दी)","mr":"Marathi (मराठी)","ta":"Tamil (தமிழ்)"}
MAX_CONTEXT_TOKENS = 4000

def get_cached_baseline(tid):
    try:
        r = supabase.table("textbooks").select("baseline_token_count").eq("id",tid).single().execute()
        return r.data.get("baseline_token_count",84000) if r.data else 84000
    except: return 84000

def truncate(text, max_t):
    t = count_tokens(text)
    if t <= max_t: return text
    return text[:int(len(text)*(max_t/max(1,t))*0.9)]

def build_context(q, tid, prune):
    if prune:
        emb = embed_text(q)
        res = query_chunks(tid, emb, n_results=3)
        docs = res["documents"][0] if res["documents"] else []
        metas = res["metadatas"][0] if res["metadatas"] else []
        ctx = truncate("\n\n---\n\n".join(docs), MAX_CONTEXT_TOKENS)
        srcs = [{"chapter":m.get("chapter_title","?"),"page":m.get("page_number",0)} for m in metas]
        return ctx, srcs
    else:
        return truncate(get_all_documents(tid), MAX_CONTEXT_TOKENS), []

def stream_answer(question, textbook_id, pruning_enabled, language, user_id):
    start = time.time()
    try:
        ctx, srcs = build_context(question, textbook_id, pruning_enabled)
    except Exception as e:
        print(f"[PRUNER] Ctx err: {e}")
        yield f"data: {json.dumps({'type':'text','data':'Could not retrieve content. Try again.'})}\n\n"
        yield f"data: {json.dumps({'type':'done','data':''})}\n\n"
        return

    tu = count_tokens(ctx); tb = get_cached_baseline(textbook_id)
    lang = LANGUAGE_MAP.get(language,"English")
    ca = calculate_cost_inr(tu); cb = calculate_cost_inr(tb)
    savings = round(cb - ca, 6) if cb > ca else 0

    src = f"Chapter: {srcs[0]['chapter']}, Page {srcs[0]['page']}" if srcs else ""

    yield f"data: {json.dumps({'type':'meta','data':json.dumps({'tokens_used':tu,'tokens_baseline':tb,'cost_actual':round(ca,6),'cost_baseline':round(cb,6),'savings':savings,'source':src,'pruning_enabled':pruning_enabled})})}\n\n"

    sys_prompt = f"""You are a helpful tutor for Indian school students. Answer from the textbook content below.
End with: Source: [Chapter, Page]. Respond in {lang}. Be clear, educational, and detailed."""

    try:
        for delta in stream_chat(sys_prompt, f"Textbook:\n{ctx}\n\nQuestion: {question}", max_tokens=1000):
            yield f"data: {json.dumps({'type':'text','data':delta})}\n\n"
    except Exception as e:
        err = str(e); print(f"[PRUNER] Groq err: {err}")
        yield f"data: {json.dumps({'type':'text','data':'An error occurred. Please try again.'})}\n\n"

    ms = int((time.time()-start)*1000)
    try:
        supabase.table("query_logs").insert({"user_id":user_id,"textbook_id":textbook_id,"question_preview":question[:100],"tokens_used":tu,"tokens_baseline":tb,"cost_actual":float(ca),"cost_baseline":float(cb),"response_time_ms":ms,"pruning_enabled":pruning_enabled,"language":language}).execute()
    except: pass
    yield f"data: {json.dumps({'type':'done','data':''})}\n\n"
