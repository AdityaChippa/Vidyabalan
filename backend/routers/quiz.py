"""Quiz router — generate, submit with flexible schema to avoid 422 errors."""
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List, Any
from routers.auth import get_user_id
from services.quiz_generator import generate_quiz_for_chapter, get_quiz_questions, answers_match
from utils.supabase_client import supabase

router = APIRouter(prefix="/api/quiz", tags=["quiz"])

class GenerateRequest(BaseModel):
    textbook_id: str
    chapter_id: Optional[str] = None
    question_type: str = "mixed"
    difficulty: str = "medium"
    count: int = 15

# Flexible submit request — accepts any dict structure
class SubmitRequest(BaseModel):
    textbook_id: str
    chapter_id: Optional[str] = None
    questions: List[Any]  # Accept any structure
    answers: List[Any]    # Accept any structure
    time_taken_seconds: Optional[int] = None

@router.post("/generate")
async def generate_quiz(req: GenerateRequest, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    
    questions = get_quiz_questions(req.textbook_id, req.chapter_id, req.question_type, req.difficulty, req.count)
    
    if not questions and req.chapter_id:
        ch = supabase.table("chapters").select("*").eq("id", req.chapter_id).single().execute()
        if ch.data:
            chunks = supabase.table("chunks").select("content").eq("chapter_id", req.chapter_id).execute()
            text = " ".join([c["content"] for c in (chunks.data or [])])[:3000]
            if text:
                questions = generate_quiz_for_chapter(req.textbook_id, req.chapter_id, ch.data["title"], text, req.difficulty)
    
    return {"questions": questions or [], "source": "cached" if questions else "generated"}

@router.post("/submit")
async def submit_quiz(request: Request, authorization: str = Header(None)):
    """Flexible submit endpoint — parses body manually to avoid 422."""
    user_id = get_user_id(authorization)
    
    try:
        body = await request.json()
    except:
        raise HTTPException(400, "Invalid JSON body")
    
    textbook_id = body.get("textbook_id", "")
    chapter_id = body.get("chapter_id")
    questions = body.get("questions", [])
    answers = body.get("answers", [])
    time_taken = body.get("time_taken_seconds", 0)
    
    if not questions:
        raise HTTPException(400, "No questions provided")
    
    score = 0
    total = len(questions)
    results = []
    
    for i, q in enumerate(questions):
        if isinstance(q, str):
            q = {"question": q, "question_type": "short_answer", "correct_answer": ""}
        
        ans = answers[i] if i < len(answers) else {}
        if isinstance(ans, str):
            ans = {"answer": ans}
        
        student_ans = ans.get("answer", "") if isinstance(ans, dict) else str(ans)
        correct_ans = q.get("correct_answer", "") if isinstance(q, dict) else ""
        q_type = q.get("question_type", "short_answer") if isinstance(q, dict) else "short_answer"
        
        if q_type == "mcq":
            is_correct = student_ans.strip() == correct_ans.strip()
        else:
            is_correct = answers_match(student_ans, correct_ans)
        
        if is_correct:
            score += 1
        
        results.append({
            "question": q.get("question", "") if isinstance(q, dict) else str(q),
            "student_answer": student_ans,
            "correct_answer": correct_ans,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "") if isinstance(q, dict) else "",
        })
    
    # Save attempt
    try:
        supabase.table("quiz_attempts").insert({
            "user_id": user_id,
            "textbook_id": textbook_id,
            "chapter_id": chapter_id,
            "questions": questions,
            "answers": answers,
            "score": score,
            "total": total,
            "time_taken_seconds": time_taken,
        }).execute()
    except Exception as e:
        print(f"[QUIZ] Save attempt err: {e}")
    
    return {"score": score, "total": total, "results": results, "percentage": round(score / max(1, total) * 100)}
