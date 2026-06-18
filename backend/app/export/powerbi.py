import requests
from fastapi import HTTPException
from app.analysis.service import get_assessment
from app.roadmap.service import get_current_roadmap

def push_to_powerbi(assessment_id: str, user_id: str, push_url: str):
    """
    Fetches all user data (Assessment, Skills, Questions, Roadmap)
    and pushes it to a Power BI Streaming Dataset URL.
    """
    if not push_url.startswith("https://api.powerbi.com"):
        raise HTTPException(status_code=400, detail="Invalid Power BI Push URL provided.")
        
    # Fetch data
    assessment_data = get_assessment(assessment_id, user_id)
    roadmap_data = get_current_roadmap(user_id)
    
    # 1. Format Assessment Summary
    summary_record = {
        "DatasetType": "AssessmentSummary",
        "AssessmentID": assessment_data["id"],
        "UserID": user_id,
        "TargetRole": assessment_data["target_role"],
        "ReadinessScore": assessment_data["readiness_score"],
        "DateAnalyzed": assessment_data["created_at"]
    }
    
    # 2. Format Skills Gap Data
    skills_records = []
    for skill in assessment_data.get("skills", []):
        skills_records.append({
            "DatasetType": "SkillGap",
            "AssessmentID": assessment_data["id"],
            "SkillName": skill["name"],
            "Status": skill["status"],
            "IsRequired": skill.get("is_required", True)
        })
        
    # 3. Format Interview Prep Data
    interview_records = []
    for q in assessment_data.get("questions", []):
        interview_records.append({
            "DatasetType": "InterviewQuestion",
            "AssessmentID": assessment_data["id"],
            "Category": q.get("category", "General"),
            "TargetSkill": q.get("skill", "General")
        })
        
    # 4. Format Roadmap Progress
    roadmap_records = []
    for rm in roadmap_data:
        roadmap_records.append({
            "DatasetType": "RoadmapMilestone",
            "UserID": user_id,
            "MilestoneTitle": rm.get("milestone_title", ""),
            "Status": rm.get("status", "pending"),
            "TargetDate": rm.get("target_date", "")
        })
        
    # Combine all records into a single array for the Power BI Push API
    payload = [summary_record] + skills_records + interview_records + roadmap_records
    
    # Push to Power BI
    try:
        response = requests.post(push_url, json=payload, headers={"Content-Type": "application/json"})
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Failed to push to Power BI: {str(e)}")
        
    return {"status": "success", "message": f"Successfully pushed {len(payload)} rows to Power BI."}
