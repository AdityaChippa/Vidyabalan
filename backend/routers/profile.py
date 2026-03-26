from fastapi import APIRouter, Header, HTTPException, UploadFile, File
from routers.auth import get_user_id
from utils.supabase_client import supabase
import uuid

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/")
async def get_profile(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data


@router.put("/")
async def update_profile(updates: dict, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    allowed = {"full_name", "class_level", "language", "avatar_url"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        raise HTTPException(status_code=400, detail="No valid fields")
    result = supabase.table("profiles").update(filtered).eq("id", user_id).execute()
    return result.data[0] if result.data else {}


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    file_bytes = await file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 5MB)")

    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    path = f"avatars/{user_id}/{uuid.uuid4()}.{ext}"

    try:
        supabase.storage.from_("textbooks").upload(path, file_bytes, {"content-type": file.content_type or "image/jpeg"})
        url = supabase.storage.from_("textbooks").get_public_url(path)
        supabase.table("profiles").update({"avatar_url": url}).eq("id", user_id).execute()
        return {"avatar_url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/")
async def delete_account(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    try:
        supabase.table("profiles").delete().eq("id", user_id).execute()
        supabase.auth.admin.delete_user(user_id)
        return {"message": "Account deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
