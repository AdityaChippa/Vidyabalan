from fastapi import APIRouter, Header, HTTPException
from models.schemas import StudyPlanGenerate
from routers.auth import get_user_id
from utils.supabase_client import supabase
from services.study_planner import generate_study_plan
from datetime import date
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/study-plan", tags=["study_plan"])

class GeneratePlanRequest(BaseModel):
    textbook_id: str
    exam_date: Optional[str] = None
    daily_hours: float = 2.0

@router.post("/generate")
async def generate_plan_endpoint(req: GeneratePlanRequest, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    from services.study_planner import generate_study_plan
    generate_study_plan(req.textbook_id, user_id, req.exam_date, req.daily_hours)
    try:
        r = supabase.table("study_plans").select("*").eq("user_id", user_id).eq("textbook_id", req.textbook_id).single().execute()
        return r.data or {"plan": []}
    except:
        return {"plan": []}

@router.post("/generate")
async def create_study_plan(req: StudyPlanGenerate, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    exam_date = req.exam_date
    if not exam_date:
        from datetime import timedelta
        exam_date = date.today() + timedelta(days=30)

    plan = generate_study_plan(req.textbook_id, user_id, exam_date, req.daily_hours)
    return plan


@router.get("/{textbook_id}")
async def get_study_plan(textbook_id: str, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("study_plans").select("*").eq("user_id", user_id).eq("textbook_id", textbook_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No study plan found. Generate one first.")
    return result.data


@router.put("/{textbook_id}/day/{day_number}")
async def toggle_day_complete(textbook_id: str, day_number: int, body: dict, authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    result = supabase.table("study_plans").select("*").eq("user_id", user_id).eq("textbook_id", textbook_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan = result.data["plan"]
    completed = body.get("completed", True)
    for entry in plan:
        if entry.get("day") == day_number:
            entry["completed"] = completed
            break

    supabase.table("study_plans").update({"plan": plan, "updated_at": "now()"}).eq("id", result.data["id"]).execute()

    # Update streak
    if completed:
        profile = supabase.table("profiles").select("streak_days, last_active").eq("id", user_id).single().execute()
        if profile.data:
            from datetime import date as dt_date, timedelta
            last = profile.data.get("last_active")
            streak = profile.data.get("streak_days", 0)
            today = dt_date.today()
            if last:
                last_date = dt_date.fromisoformat(str(last))
                if last_date == today - timedelta(days=1):
                    streak += 1
                elif last_date != today:
                    streak = 1
            else:
                streak = 1
            supabase.table("profiles").update({"streak_days": streak, "last_active": today.isoformat()}).eq("id", user_id).execute()

    return {"success": True}
