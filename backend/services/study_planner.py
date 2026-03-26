import json, math
from datetime import datetime, timedelta, timezone
from utils.supabase_client import supabase

def generate_study_plan(textbook_id, user_id, exam_date=None, daily_hours=2.0):
    chs = supabase.table("chapters").select("*").eq("textbook_id", textbook_id).order("chapter_number").execute()
    chapters = chs.data or []
    if not chapters: return
    n = len(chapters); today = datetime.now(timezone.utc).date()
    exam = datetime.strptime(exam_date, "%Y-%m-%d").date() if exam_date else today + timedelta(days=max(14, n*2))
    total_days = max(7, (exam - today).days)
    study_d = max(n, int(total_days * 0.6)); rev_d = max(2, int(total_days * 0.25))
    plan = []; day_num = 0; ch_idx = 0; cpd = max(1, math.ceil(n / study_d))
    for d in range(study_d):
        day_num += 1; date = today + timedelta(days=day_num); dc = []
        for _ in range(cpd):
            if ch_idx < n:
                ch = chapters[ch_idx]
                dc.append({"chapter_number":ch["chapter_number"],"title":ch["title"],"chapter_id":ch["id"],"pages":f"{ch['page_start']}-{ch['page_end']}","minutes":ch.get("estimated_minutes",30)})
                ch_idx += 1
        if dc:
            cn = ", ".join([f"Ch {c['chapter_number']}: {c['title']}" for c in dc])
            plan.append({"day":day_num,"date":date.isoformat(),"type":"study","title":f"Study: {cn}","chapters":dc,
                "goals":[f"Read Chapter {c['chapter_number']}: {c['title']}" for c in dc]+["Take notes","Try chapter quiz"],"hours":daily_hours,"completed":False})
        if ch_idx > 0 and ch_idx % 5 == 0:
            day_num += 1; date = today + timedelta(days=day_num)
            plan.append({"day":day_num,"date":date.isoformat(),"type":"quiz","title":f"Quiz: Ch {max(1,ch_idx-4)}-{ch_idx}","chapters":[],
                "goals":[f"Quiz chapters {max(1,ch_idx-4)}-{ch_idx}","Review wrong answers","Note weak topics"],"hours":1.0,"completed":False})
    rpd = max(1, math.ceil(n / rev_d)); ch_idx = 0
    for d in range(rev_d):
        day_num += 1; date = today + timedelta(days=day_num); rc = []
        for _ in range(rpd):
            if ch_idx < n: rc.append(f"Ch {chapters[ch_idx]['chapter_number']}: {chapters[ch_idx]['title']}"); ch_idx += 1
        plan.append({"day":day_num,"date":date.isoformat(),"type":"revision","title":f"Revision: {', '.join(rc[:3])}{'...' if len(rc)>3 else ''}","chapters":[],
            "goals":[f"Revise {c}" for c in rc[:5]]+["Review flashcards","Redo wrong questions"],"hours":daily_hours,"completed":False})
    day_num += 1; date = today + timedelta(days=day_num)
    plan.append({"day":day_num,"date":date.isoformat(),"type":"quiz","title":"Full Mock Test","chapters":[],
        "goals":["Full quiz all chapters","Time yourself","Review all wrong answers","Be confident!"],"hours":2.0,"completed":False})
    try:
        ex = supabase.table("study_plans").select("id").eq("user_id",user_id).eq("textbook_id",textbook_id).execute()
        pd = {"user_id":user_id,"textbook_id":textbook_id,"exam_date":exam.isoformat() if exam_date else None,"daily_hours":daily_hours,"plan":plan}
        if ex.data and len(ex.data)>0: supabase.table("study_plans").update(pd).eq("id",ex.data[0]["id"]).execute()
        else: supabase.table("study_plans").insert(pd).execute()
        print(f"[PLANNER] {len(plan)}-day plan for {n} chapters")
    except Exception as e: print(f"[PLANNER] Error: {e}")
