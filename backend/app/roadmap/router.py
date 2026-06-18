from fastapi import APIRouter, Depends
from app.auth.router import get_current_user_id
from app.roadmap import service
from app.roadmap.schemas import MilestoneResponse, MilestoneStatusUpdate

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])


@router.get("", response_model=list[MilestoneResponse])
def get_roadmap(user_id: str = Depends(get_current_user_id)):
    """Get the current active roadmap for the user."""
    return service.get_current_roadmap(user_id)


@router.patch("/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(
    milestone_id: str,
    body: MilestoneStatusUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update the status of a milestone (pending, in_progress, completed)."""
    return service.update_milestone_status(user_id, milestone_id, body.status)
