from fastapi import APIRouter, Depends
from app.auth.router import get_current_user_id
from app.progress import service
from app.progress.schemas import ProgressSummaryResponse, SkillProgressResponse, SkillProgressUpdate

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("/summary", response_model=ProgressSummaryResponse)
def get_summary(user_id: str = Depends(get_current_user_id)):
    """Get high-level summary and readiness trend."""
    return service.get_progress_summary(user_id)


@router.get("/skills", response_model=list[SkillProgressResponse])
def get_all_skills(user_id: str = Depends(get_current_user_id)):
    """Get learning status for all skills."""
    return service.get_all_skills_progress(user_id)


@router.patch("/skills/{skill_name}", response_model=SkillProgressResponse)
def update_skill(
    skill_name: str,
    body: SkillProgressUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update learning status for a specific skill."""
    return service.update_skill_status(user_id, skill_name, body.status)
