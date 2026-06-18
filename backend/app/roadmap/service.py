from fastapi import HTTPException
from app.database import get_admin_supabase


def get_current_roadmap(user_id: str) -> list[dict]:
    """Fetch the active roadmap milestones for the user."""
    db = get_admin_supabase()
    rows = (
        db.table("roadmap")
        .select("*")
        .eq("user_id", user_id)
        .order("order_index", desc=False)
        .execute()
        .data
    )
    return rows


def update_milestone_status(user_id: str, milestone_id: str, status: str) -> dict:
    """Update the status of a specific milestone."""
    if status not in ["pending", "in_progress", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    db = get_admin_supabase()
    # Verify ownership
    row = db.table("roadmap").select("user_id").eq("id", milestone_id).execute()
    if not row.data or row.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Milestone not found")

    result = (
        db.table("roadmap")
        .update({"status": status})
        .eq("id", milestone_id)
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to update milestone")
    return result.data[0]
