from pydantic import BaseModel
from typing import Optional


class MilestoneStatusUpdate(BaseModel):
    status: str  # "pending", "in_progress", "completed"


class MilestoneResponse(BaseModel):
    id: str
    assessment_id: str
    milestone_title: str
    description: str
    target_date: str
    status: str
    order_index: int
    course_url: Optional[str] = None
