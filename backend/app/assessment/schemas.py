from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class GenerateAssessmentRequest(BaseModel):
    user_id: str

class SubmitAnswerRequest(BaseModel):
    answers: Dict[str, int]  # key: question_id, value: selected_option index

class AssessmentTestSummary(BaseModel):
    id: str
    title: str
    score: float
    total_questions: int
    correct_answers: int
    status: str
    created_at: str

class QuestionItem(BaseModel):
    id: str
    question_text: str
    options: List[str]
    skill_area: str

class AssessmentTestDetail(BaseModel):
    id: str
    title: str
    questions: List[QuestionItem]

class AnswerResult(BaseModel):
    question_id: str
    question_text: str
    options: List[str]
    correct_option: int
    selected_option: Optional[int]
    is_correct: bool
    explanation: str
    skill_area: str

class AssessmentResult(BaseModel):
    id: str
    score: float
    total_questions: int
    correct_answers: int
    answers: List[AnswerResult]
