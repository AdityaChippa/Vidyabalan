from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from routers.auth import get_user_id
from services.groq_client import chat_completion_sync
from utils.supabase_client import supabase

router = APIRouter(prefix="/api/content", tags=["content"])

class GenerateRequest(BaseModel):
    chapter_id: str
    content_type: str
    textbook_id: str = ""

class EvaluateRequest(BaseModel):
    chapter_id: str
    question: str
    answer: str

@router.post("/generate")
async def generate_content(req: GenerateRequest, authorization: str = Header(None)):
    get_user_id(authorization)
    ch = supabase.table("chapters").select("*").eq("id", req.chapter_id).single().execute()
    if not ch.data:
        raise HTTPException(404, "Chapter not found")
    title = ch.data.get("title", "")
    chunks = supabase.table("chunks").select("content").eq("chapter_id", req.chapter_id).order("chunk_index").execute()
    chapter_text = "\n".join([c["content"] for c in (chunks.data or [])])[:4000]
    if not chapter_text:
        return {"data": "No textbook content found for this chapter."}
    prompts = {
        "teaching": f"You are an expert teacher. Teach this chapter clearly with examples.\n\nChapter: {title}\nContent:\n{chapter_text}\n\nTeach step by step:",
        "summary": f"Create a concise summary for exam revision with all key points.\n\nChapter: {title}\nContent:\n{chapter_text}\n\nSummary:",
        "exam_notes": f"Create bullet-point exam notes with definitions and key facts.\n\nChapter: {title}\nContent:\n{chapter_text}\n\nExam Notes:",
        "flashcards": f"Create 10 flashcard Q&A pairs.\nQ: [question]\nA: [answer]\n\nChapter: {title}\nContent:\n{chapter_text}\n\nFlashcards:"
    }
    result = chat_completion_sync("You are a helpful tutor for Indian school students.", prompts.get(req.content_type, prompts["summary"]), max_tokens=1500)
    if not result:
        return {"data": "AI is busy. Please try again in a minute."}
    return {"data": result, "chapter_title": title, "content_type": req.content_type}

@router.post("/evaluate")
async def evaluate_answer(req: EvaluateRequest, authorization: str = Header(None)):
    get_user_id(authorization)
    ch = supabase.table("chapters").select("title").eq("id", req.chapter_id).single().execute()
    title = ch.data.get("title", "") if ch.data else ""
    chunks = supabase.table("chunks").select("content").eq("chapter_id", req.chapter_id).order("chunk_index").limit(5).execute()
    ref = "\n".join([c["content"] for c in (chunks.data or [])])[:3000]
    result = chat_completion_sync("You are a fair exam evaluator.", f"Chapter: {title}\nReference: {ref}\nQuestion: {req.question}\nAnswer: {req.answer}\nScore/10, correct parts, missing parts, model answer:", max_tokens=800)
    if not result:
        return {"data": "AI is busy. Try again shortly."}
    return {"data": result, "chapter_title": title}
