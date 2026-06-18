from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.auth.router import get_current_user_id
from app.export import service

router = APIRouter(prefix="/api/export", tags=["export"])


@router.get("/pdf/{assessment_id}")
def export_pdf(assessment_id: str, user_id: str = Depends(get_current_user_id)):
    """Download assessment result as a formatted PDF."""
    pdf_buffer = service.generate_pdf_report(assessment_id, user_id)
    return StreamingResponse(
        pdf_buffer, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=assessment_{assessment_id}.pdf"}
    )


@router.get("/csv/{assessment_id}")
def export_csv(assessment_id: str, user_id: str = Depends(get_current_user_id)):
    """Download assessment data as CSV."""
    csv_buffer = service.generate_csv_export(assessment_id, user_id)
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=assessment_{assessment_id}.csv"}
    )
from pydantic import BaseModel

class PowerBIRequest(BaseModel):
    push_url: str

@router.post("/powerbi/{assessment_id}")
def export_powerbi(assessment_id: str, body: PowerBIRequest, user_id: str = Depends(get_current_user_id)):
    """Push assessment data directly to Power BI Streaming Dataset."""
    from app.export.powerbi import push_to_powerbi
    return push_to_powerbi(assessment_id, user_id, body.push_url)
