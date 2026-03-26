from fastapi import APIRouter, Header, HTTPException
from routers.auth import get_user_id
from utils.supabase_client import supabase
from datetime import date, timedelta

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
async def get_summary(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    today = date.today().isoformat()

    try:
        # Today's queries
        logs_today = supabase.table("query_logs").select("tokens_used, tokens_baseline, cost_actual, cost_baseline, response_time_ms").gte("created_at", f"{today}T00:00:00").execute()
        logs = logs_today.data or []

        total_queries = len(logs)
        total_tokens_saved = sum((l.get("tokens_baseline", 0) - l.get("tokens_used", 0)) for l in logs)
        total_cost_saved = sum((float(l.get("cost_baseline", 0)) - float(l.get("cost_actual", 0))) for l in logs)
        avg_cost = sum(float(l.get("cost_actual", 0)) for l in logs) / max(1, total_queries)
        avg_response = sum(l.get("response_time_ms", 0) for l in logs) // max(1, total_queries)

        # School stats
        students = supabase.table("profiles").select("id", count="exact").eq("role", "student").execute()
        active = supabase.table("profiles").select("id", count="exact").eq("last_active", today).execute()
        books = supabase.table("textbooks").select("id", count="exact").execute()

        return {
            "total_queries_today": total_queries,
            "total_tokens_saved": total_tokens_saved,
            "total_cost_saved_inr": round(total_cost_saved, 4),
            "avg_cost_per_query_inr": round(avg_cost, 6),
            "avg_response_time_ms": avg_response,
            "total_students": students.count or 0,
            "active_today": active.count or 0,
            "total_books": books.count or 0,
        }
    except Exception as e:
        print(f"Analytics summary error: {e}")
        return {
            "total_queries_today": 0,
            "total_tokens_saved": 0,
            "total_cost_saved_inr": 0,
            "avg_cost_per_query_inr": 0,
            "avg_response_time_ms": 0,
            "total_students": 0,
            "active_today": 0,
            "total_books": 0
        }


@router.get("/daily-costs")
async def get_daily_costs(authorization: str = Header(None)):
    get_user_id(authorization)
    costs = []
    for i in range(6, -1, -1):
        d = date.today() - timedelta(days=i)
        d_str = d.isoformat()
        try:
            logs = supabase.table("query_logs").select("cost_actual, cost_baseline").gte("created_at", f"{d_str}T00:00:00").lt("created_at", f"{d_str}T23:59:59").execute()
            data = logs.data or []
            baseline = sum(float(l.get("cost_baseline", 0)) for l in data)
            actual = sum(float(l.get("cost_actual", 0)) for l in data)
            costs.append({
                "date": d_str,
                "label": d.strftime("%a"),
                "baseline_cost": round(baseline, 4),
                "vidyai_cost": round(actual, 4)
            })
        except Exception:
            costs.append({"date": d_str, "label": d.strftime("%a"), "baseline_cost": 0, "vidyai_cost": 0})
    return costs


@router.get("/queries-per-hour")
async def get_queries_per_hour(authorization: str = Header(None)):
    get_user_id(authorization)
    today = date.today().isoformat()
    hours = []
    for h in range(24):
        start = f"{today}T{h:02d}:00:00"
        end = f"{today}T{h:02d}:59:59"
        try:
            result = supabase.table("query_logs").select("id", count="exact").gte("created_at", start).lte("created_at", end).execute()
            hours.append({"hour": h, "label": f"{h:02d}:00", "count": result.count or 0})
        except Exception:
            hours.append({"hour": h, "label": f"{h:02d}:00", "count": 0})
    return hours


@router.get("/language-distribution")
async def get_language_distribution(authorization: str = Header(None)):
    get_user_id(authorization)
    try:
        result = supabase.table("query_logs").select("language").execute()
        logs = result.data or []
        dist = {}
        for l in logs:
            lang = l.get("language", "en")
            dist[lang] = dist.get(lang, 0) + 1

        lang_names = {"en": "English", "hi": "Hindi", "mr": "Marathi", "ta": "Tamil"}
        return [{"language": lang_names.get(k, k), "code": k, "count": v} for k, v in dist.items()]
    except Exception:
        return [{"language": "English", "code": "en", "count": 0}]


@router.get("/recent-queries")
async def get_recent_queries(authorization: str = Header(None)):
    get_user_id(authorization)
    try:
        result = supabase.table("query_logs").select("*").order("created_at", desc=True).limit(20).execute()
        return result.data if result.data else []
    except Exception:
        return []


@router.get("/user-progress")
async def get_user_progress(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    try:
        profile = supabase.table("profiles").select("streak_days").eq("id", user_id).single().execute()
        streak = profile.data.get("streak_days", 0) if profile.data else 0

        quiz_attempts = supabase.table("quiz_attempts").select("score, total, created_at").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
        attempts = quiz_attempts.data or []

        query_count = supabase.table("query_logs").select("id", count="exact").eq("user_id", user_id).execute()

        return {
            "streak_days": streak,
            "total_questions_asked": query_count.count or 0,
            "quiz_history": attempts,
            "avg_quiz_score": round(sum(a["score"] for a in attempts) / max(1, len(attempts)), 1) if attempts else 0
        }
    except Exception as e:
        print(f"User progress error: {e}")
        return {"streak_days": 0, "total_questions_asked": 0, "quiz_history": [], "avg_quiz_score": 0}

@router.get("/quiz-attempts")
async def get_quiz_attempts(authorization: str = Header(None)):
    user_id = get_user_id(authorization)
    try:
        r = supabase.table("quiz_attempts").select("id,score,total,created_at").eq("user_id", user_id).order("created_at").execute()
        return r.data or []
    except:
        return []