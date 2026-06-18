from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from app.auth.router import get_current_user_id
from app.assessment import schemas, service

router = APIRouter(prefix="/api/assessment", tags=["Assessment"])

@router.post("/generate", response_model=schemas.AssessmentTestDetail)
def generate_assessment(user_id: str = Depends(get_current_user_id)):
    try:
        result = service.generate_assessment(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{test_id}/submit", response_model=schemas.AssessmentResult)
def submit_assessment(test_id: str, payload: schemas.SubmitAnswerRequest, user_id: str = Depends(get_current_user_id)):
    try:
        result = service.submit_assessment(test_id, user_id, payload.answers)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/history", response_model=List[schemas.AssessmentTestSummary])
def get_history(user_id: str = Depends(get_current_user_id)):
    try:
        result = service.get_assessment_history(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{test_id}", response_model=schemas.AssessmentResult)
def get_assessment(test_id: str, user_id: str = Depends(get_current_user_id)):
    try:
        result = service.get_assessment_detail(test_id, user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
