from pydantic import BaseModel
from typing import Optional, Any


class AnalysisUploadRequest(BaseModel):
    target_role: str


class SkillItem(BaseModel):
    name: str
    status: str          # "present" | "missing"
    is_required: bool
    confidence: Optional[float] = None


class CourseItem(BaseModel):
    title: str
    platform: str
    url: str
    free: bool = False
    thumbnail: Optional[str] = None
    channel: Optional[str] = None
    is_search: bool = False


class QuestionItem(BaseModel):
    question: str
    category: str        # "technical" | "project" | "scenario"
    skill: Optional[str] = None
    relevance_score: Optional[float] = None
    source: Optional[str] = None
    is_gap: Optional[bool] = False
    answer: Optional[str] = None
    key_points: list[str] = []
    interviewer_intent: Optional[str] = None


class ProfileSummary(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    education: list[dict] = []
    skills: list[str] = []
    projects: list[str] = []
    certifications: list[str] = []


class AnalysisResult(BaseModel):
    id: str
    user_id: str
    target_role: str
    created_at: str
    readiness_score: float
    profile: ProfileSummary
    skills: list[SkillItem]
    questions: list[QuestionItem]
    courses: dict[str, list[CourseItem]]
    roadmap_generated: bool = False


class AssessmentSummary(BaseModel):
    id: str
    target_role: str
    readiness_score: float
    created_at: str
    skills_matched: int
    skills_missing: int
