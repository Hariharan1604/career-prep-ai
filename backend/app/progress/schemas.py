from pydantic import BaseModel
from typing import Optional


class SkillProgressUpdate(BaseModel):
    status: str  # "not_started", "learning", "completed"


class SkillProgressResponse(BaseModel):
    id: str
    user_id: str
    skill_name: str
    status: str
    course_url: Optional[str] = None
    updated_at: str


class ProgressSummaryResponse(BaseModel):
    total_skills: int
    completed: int
    learning: int
    not_started: int
    readiness_trend: list[dict]  # [{"date": "...", "score": 45.0}]
