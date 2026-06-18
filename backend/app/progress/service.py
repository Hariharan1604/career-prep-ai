import uuid
from datetime import datetime
from fastapi import HTTPException
from app.database import get_supabase


def get_progress_summary(user_id: str) -> dict:
    """Get high-level summary of learning progress + readiness trend."""
    db = get_supabase()

    # 1. Fetch skill progress status
    progress_rows = db.table("user_progress").select("*").eq("user_id", user_id).execute().data
    
    total = len(progress_rows)
    completed = sum(1 for p in progress_rows if p["status"] == "completed")
    learning = sum(1 for p in progress_rows if p["status"] == "learning")
    not_started = sum(1 for p in progress_rows if p["status"] == "not_started")

    # 2. Fetch readiness trend from assessments
    assessments = (
        db.table("assessments")
        .select("created_at, readiness_score")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
        .data
    )

    trend = [{"date": a["created_at"].split("T")[0], "score": a["readiness_score"]} for a in assessments]

    return {
        "total_skills": total,
        "completed": completed,
        "learning": learning,
        "not_started": not_started,
        "readiness_trend": trend,
    }


def get_all_skills_progress(user_id: str) -> list[dict]:
    db = get_supabase()
    return db.table("user_progress").select("*").eq("user_id", user_id).execute().data


def update_skill_status(user_id: str, skill_name: str, status: str) -> dict:
    if status not in ["not_started", "learning", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    db = get_supabase()
    
    # Check if exists
    existing = db.table("user_progress").select("*").eq("user_id", user_id).eq("skill_name", skill_name).execute()
    
    now = datetime.utcnow().isoformat()
    if existing.data:
        # Update
        res = db.table("user_progress").update({
            "status": status,
            "updated_at": now
        }).eq("id", existing.data[0]["id"]).execute()
        return res.data[0]
    else:
        # Insert new tracking record
        res = db.table("user_progress").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "skill_name": skill_name,
            "status": status,
            "updated_at": now
        }).execute()
        return res.data[0]
