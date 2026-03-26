from fastapi import APIRouter, Header, HTTPException
from utils.supabase_client import supabase

router = APIRouter(prefix="/api/auth", tags=["auth"])


def get_user_id(authorization: str = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")
    token = authorization.replace("Bearer ", "")
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


@router.get("/profile")
async def get_profile(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    return result.data


@router.put("/profile")
async def update_profile(updates: dict, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    allowed = {"full_name", "class_level", "language", "avatar_url"}
    filtered = {k: v for k, v in updates.items() if k in allowed}
    if not filtered:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    result = supabase.table("profiles").update(filtered).eq("id", user_id).execute()
    return result.data[0] if result.data else {}


@router.get("/verify")
async def verify_token(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("profiles").select("id, role, full_name").eq("id", user_id).single().execute()
    return {"valid": True, "user_id": user_id, "profile": result.data}
