from fastapi import APIRouter, Header, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from routers.auth import get_user_id
from services.context_pruner import stream_answer
from utils.supabase_client import supabase

router = APIRouter(prefix="/api/query", tags=["query"])

class AskRequest(BaseModel):
    question: str
    textbook_id: str
    pruning_enabled: bool = True
    language: str = "en"

@router.post("/ask")
async def ask(req: AskRequest, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    return StreamingResponse(
        stream_answer(req.question, req.textbook_id, req.pruning_enabled, req.language, user_id),
        media_type="text/event-stream",
        headers={"Cache-Control":"no-cache","Connection":"keep-alive","X-Accel-Buffering":"no"}
    )

@router.get("/conversations/{textbook_id}")
async def get_conversations(textbook_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    try:
        r = supabase.table("conversations").select("*").eq("user_id",user_id).eq("textbook_id",textbook_id).order("created_at",desc=True).limit(50).execute()
        return r.data or []
    except: return []

@router.post("/conversations/{textbook_id}")
async def save_conversation(textbook_id: str, request: Request, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    body = await request.json()
    try:
        supabase.table("conversations").insert({"user_id":user_id,"textbook_id":textbook_id,"role":body.get("role","user"),"content":body.get("content",""),"metadata":body.get("metadata",{})}).execute()
        return {"ok":True}
    except Exception as e:
        return {"ok":False,"error":str(e)}