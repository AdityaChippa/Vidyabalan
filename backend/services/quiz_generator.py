import json, re
from services.groq_client import chat_completion_sync
from utils.supabase_client import supabase
MAX_CH = 3000

def normalize_answer(ans):
    if not ans: return ""
    ans = ans.lower().strip()
    return re.sub(r'\s+', ' ', re.sub(r'[^\w\s]', '', ans))

def answers_match(student, correct):
    s, c = normalize_answer(student), normalize_answer(correct)
    if not s or not c: return False
    if s == c or s in c or c in s: return True
    sw, cw = set(s.split()), set(c.split())
    if sw and cw and len(sw & cw) / max(len(sw), len(cw)) >= 0.6: return True
    formulas = {'h2o':'water','co2':'carbon dioxide','o2':'oxygen','nacl':'sodium chloride','hcl':'hydrochloric acid','mgo':'magnesium oxide','cao':'calcium oxide','fe2o3':'iron oxide','caco3':'calcium carbonate'}
    sl = student.lower().strip().replace(' ','')
    for f, n in formulas.items():
        if f in sl and n in c: return True
    return False

def generate_quiz_for_chapter(textbook_id, chapter_id, chapter_title, chapter_text, difficulty="medium", language="en"):
    text = chapter_text[:MAX_CH]
    sys = f"Generate exactly 10 MCQ and 5 short answer questions from the chapter text. Questions must be directly answerable from the text. Return ONLY valid JSON: {{\"questions\":[{{\"question\":\"...\",\"question_type\":\"mcq\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"],\"correct_answer\":\"A) ...\",\"explanation\":\"...\",\"difficulty\":\"{difficulty}\"}},{{\"question\":\"...\",\"question_type\":\"short_answer\",\"options\":null,\"correct_answer\":\"...\",\"explanation\":\"...\",\"difficulty\":\"{difficulty}\"}}]}}"
    user = f"Chapter: {chapter_title}\n\nText:\n{text}\n\nGenerate quiz. ONLY JSON."
    try:
        resp = chat_completion_sync(sys, user, max_tokens=2000)
        m = re.search(r'\{[\s\S]*\}', resp)
        if not m: return []
        qs = json.loads(m.group()).get("questions", [])
        saved = []
        for q in qs:
            qt = q.get("question_type","mcq")
            if qt not in ("mcq","short_answer"): qt = "mcq"
            if not q.get("question") or len(q["question"]) < 5: continue
            try:
                r = supabase.table("quiz_questions").insert({"textbook_id":textbook_id,"chapter_id":chapter_id,"question":q["question"],"question_type":qt,"options":q.get("options"),"correct_answer":q.get("correct_answer",""),"explanation":q.get("explanation",""),"difficulty":q.get("difficulty",difficulty)}).execute()
                if r.data: saved.append(r.data[0])
            except Exception as e: print(f"[QUIZ] Save err: {e}")
        print(f"[QUIZ] {len(saved)} questions for '{chapter_title}'")
        return saved
    except Exception as e: print(f"[QUIZ] Error: {e}"); return []

def get_quiz_questions(textbook_id, chapter_id=None, question_type="mixed", difficulty="medium", count=10):
    q = supabase.table("quiz_questions").select("*").eq("textbook_id", textbook_id)
    if chapter_id: q = q.eq("chapter_id", chapter_id)
    if question_type == "mcq": q = q.eq("question_type", "mcq")
    elif question_type == "short_answer": q = q.eq("question_type", "short_answer")
    if difficulty != "all": q = q.eq("difficulty", difficulty)
    r = q.limit(count).execute()
    return r.data or []
