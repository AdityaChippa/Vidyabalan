import uuid
from fastapi import APIRouter, UploadFile, File, Form, Header, HTTPException, BackgroundTasks
from routers.auth import get_user_id
from utils.supabase_client import supabase
from services.pdf_processor import process_textbook

router = APIRouter(prefix="/api/textbooks", tags=["textbooks"])


@router.post("/upload")
async def upload_textbook(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    subject: str = Form(""),
    class_level: str = Form(""),
    board: str = Form(""),
    authorization: str = Header(None)
):
    user_id = get_user_id(authorization)

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    file_id = str(uuid.uuid4())
    storage_path = f"{user_id}/{file_id}.pdf"

    try:
        supabase.storage.from_("textbooks").upload(storage_path, file_bytes, {"content-type": "application/pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {str(e)}")

    textbook_id = str(uuid.uuid4())
    textbook_data = {
        "id": textbook_id,
        "title": title,
        "subject": subject if subject else None,
        "class_level": class_level if class_level else None,
        "board": board if board else None,
        "pdf_url": storage_path,
        "uploaded_by": user_id,
        "processing_status": "processing",
        "processing_progress": 0
    }
    supabase.table("textbooks").insert(textbook_data).execute()

    job_id = str(uuid.uuid4())
    supabase.table("processing_jobs").insert({
        "id": job_id,
        "textbook_id": textbook_id,
        "status": "processing",
        "current_step": "Starting...",
        "current_step_number": 0,
        "progress": 0,
        "steps_completed": []
    }).execute()

    background_tasks.add_task(process_textbook, job_id, textbook_id, user_id)

    return {"textbook_id": textbook_id, "job_id": job_id, "message": "Upload successful, processing started"}


@router.get("/job/{job_id}")
async def get_job_status(job_id: str):
    result = supabase.table("processing_jobs").select("*").eq("id", job_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Job not found")
    return result.data


@router.get("/")
async def list_textbooks(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("textbooks").select("*").or_(f"is_public.eq.true,uploaded_by.eq.{user_id}").order("created_at", desc=True).execute()
    return result.data if result.data else []


@router.get("/{textbook_id}")
async def get_textbook(textbook_id: str, authorization: str = Header(None)):
    get_user_id(authorization)
    result = supabase.table("textbooks").select("*").eq("id", textbook_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Textbook not found")
    return result.data


@router.get("/{textbook_id}/chapters")
async def get_chapters(textbook_id: str, authorization: str = Header(None)):
    get_user_id(authorization)
    result = supabase.table("chapters").select("*").eq("textbook_id", textbook_id).order("chapter_number").execute()
    return result.data if result.data else []


@router.delete("/{textbook_id}")
async def delete_textbook(textbook_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    textbook = supabase.table("textbooks").select("uploaded_by").eq("id", textbook_id).single().execute()
    if not textbook.data:
        raise HTTPException(status_code=404, detail="Not found")
    if textbook.data["uploaded_by"] != user_id:
        profile = supabase.table("profiles").select("role").eq("id", user_id).single().execute()
        if not profile.data or profile.data["role"] not in ("admin", "teacher"):
            raise HTTPException(status_code=403, detail="Not authorized")

    from services.vector_store import delete_collection
    delete_collection(textbook_id)
    supabase.table("textbooks").delete().eq("id", textbook_id).execute()
    return {"message": "Deleted"}

@router.get("/api/textbooks/job-by-textbook/{textbook_id}")
async def get_job_by_textbook(textbook_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    try:
        r = supabase.table("processing_jobs").select("*").eq("textbook_id", textbook_id).order("created_at", desc=True).limit(1).execute()
        if r.data and len(r.data) > 0: return r.data[0]
    except: pass
    return None

@router.get("/job-by-textbook/{textbook_id}")
async def get_job_by_textbook(textbook_id: str, authorization: str = Header(None)):
    try:
        user_id = get_user_id(authorization)
    except:
        pass
    try:
        r = supabase.table("processing_jobs").select("*").eq("textbook_id", textbook_id).order("created_at", desc=True).limit(1).execute()
        if r.data and len(r.data) > 0:
            return r.data[0]
        return {"status": "not_found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}