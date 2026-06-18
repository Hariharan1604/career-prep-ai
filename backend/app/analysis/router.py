from fastapi import APIRouter, Depends, UploadFile, File, Form
from app.auth.router import get_current_user_id
from app.analysis import service
from app.analysis.schemas import AnalysisResult, AssessmentSummary

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.get("/roles", response_model=list[str])
def get_roles():
    """Get list of supported target job roles."""
    return service.get_supported_roles()


from typing import Optional

@router.post("/upload", response_model=AnalysisResult)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: str = Form("Custom Job"),
    job_description: Optional[str] = Form(None),
    user_id: str = Depends(get_current_user_id)
):
    """Upload a resume PDF and run the full ML analysis pipeline."""
    return await service.run_analysis(file, target_role, user_id, job_description)


@router.get("/history", response_model=list[AssessmentSummary])
def get_history(user_id: str = Depends(get_current_user_id)):
    """List all past assessments for the current user."""
    return service.get_history(user_id)


@router.get("/{assessment_id}", response_model=AnalysisResult)
def get_assessment(assessment_id: str, user_id: str = Depends(get_current_user_id)):
    """Get the full result of a specific assessment."""
    return service.get_assessment(assessment_id, user_id)
