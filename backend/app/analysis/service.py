"""
Analysis Service — orchestrates the full ML pipeline:
  1. Parse resume PDF
  2. Run semantic skill matching
  3. Compute skill gap
  4. Generate interview questions
  5. Rank questions
  6. Recommend courses
  7. Persist everything to Supabase
  8. Auto-generate roadmap milestones
"""
import os
import uuid
import json
import tempfile
from datetime import datetime, timedelta
from fastapi import HTTPException, UploadFile
import logging

from app.database import get_supabase, get_admin_supabase
from app.ml.resume_parser import parse_resume
from app.ml.skill_matcher import compute_skill_gap, semantic_skill_match, normalize_skills, extract_skills_from_jd
from app.ml.question_generator import build_question_set
from app.ml.question_ranker import rank_questions
from app.ml.course_recommender import recommend_courses
from app.config import settings

logger = logging.getLogger(__name__)


def get_supported_roles() -> list[str]:
    path = os.path.join(os.path.dirname(__file__), "..", "data", "role_skills.json")
    with open(path, encoding="utf-8") as f:
        return list(json.load(f).keys())


from typing import Optional

async def run_analysis(upload_file: UploadFile, target_role: str, user_id: str, job_description: Optional[str] = None, skip_persist: bool = False) -> dict:
    """Full pipeline: upload → parse → gap → questions → courses → save → return."""
    db = None

    if job_description in ["undefined", "null", "None", ""]:
        job_description = None

    # ── Validate role or JD ──────────────────────────────────────────────────
    if not job_description:
        supported = get_supported_roles()
        if target_role not in supported:
            raise HTTPException(status_code=400, detail=f"Role not supported. Choose from: {supported}")

    # ── Validate file ────────────────────────────────────────────────────────
    if not upload_file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await upload_file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File too large. Max {settings.MAX_UPLOAD_SIZE_MB}MB.")

    # ── Save to temp file for pdfplumber ───────────────────────────────────
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # ── 1. Parse resume ──────────────────────────────────────────────────
        profile = parse_resume(tmp_path)

        # ── 2. Normalize + semantic skill matching ───────────────────────────
        raw_skills = normalize_skills(profile["skills"])
        sections = profile.get("raw_sections", {})
        all_sentences = [
            s.strip()
            for text in sections.values()
            for s in text.split("\n")
            if len(s.strip()) > 10
        ]
        inferred = semantic_skill_match(all_sentences, raw_skills) if all_sentences else []
        all_skills = list(set(raw_skills + inferred))
        profile["skills"] = all_skills

        # ── 3. Compute skill gap ─────────────────────────────────────────────
        if job_description:
            # Custom JD mode
            jd_skills = extract_skills_from_jd(job_description)
            gap = compute_skill_gap(all_skills, custom_jd_skills=jd_skills)
        else:
            # Standard Predefined Role mode
            gap = compute_skill_gap(all_skills, role=target_role)

        # ── 4. Generate questions ────────────────────────────────────────────
        raw_questions = build_question_set(profile, target_role, gap, use_flan=True)

        # ── 5. Rank questions ────────────────────────────────────────────────
        ranked_questions = rank_questions(raw_questions, profile, target_role)

        # ── 6. Course recommendations ───────────────────────────────────────
        courses = recommend_courses(gap["missing_required"])

    except HTTPException:
        # Re-raise HTTPExceptions (400/413 etc.) unchanged
        raise
    except Exception as exc:
        logger.exception("Unhandled exception during analysis")
        raise HTTPException(status_code=500, detail="Internal error during analysis") from exc
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            logger.warning("Failed to remove temporary file %s", tmp_path)

    # Prepare assessment identifiers
    assessment_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    if not skip_persist:
        db = get_admin_supabase()
        # ── 7. Persist to Supabase ───────────────────────────────────────────────
        # Assessment record
        db.table("assessments").insert({
            "id": assessment_id,
            "user_id": user_id,
            "target_role": target_role,
            "job_description_text": job_description,
            "resume_filename": upload_file.filename,
            "readiness_score": gap["readiness_score"],
            "profile_json": profile,
            "created_at": now,
        }).execute()

    # Skills
    skill_rows = []
    for skill in gap["required"]:
        present = skill in gap["matched_required"]
        skill_rows.append({
            "id": str(uuid.uuid4()),
            "assessment_id": assessment_id,
            "skill_name": skill,
            "status": "present" if present else "missing",
            "is_required": True,
        })
    for skill in gap.get("matched_good_to_have", []):
        skill_rows.append({
            "id": str(uuid.uuid4()),
            "assessment_id": assessment_id,
            "skill_name": skill,
            "status": "present",
            "is_required": False,
        })
    if skill_rows and not skip_persist:
        db.table("assessment_skills").insert(skill_rows).execute()

    # Questions
    question_rows = [
        {
            "id": str(uuid.uuid4()),
            "assessment_id": assessment_id,
            "question_text": q["question"],
            "category": q.get("category", "technical"),
            "skill": q.get("skill"),
            "source": q.get("source", "retrieved"),
            "relevance_score": q.get("relevance_score", 0.5),
            "is_gap": q.get("is_gap", False),
            "ai_answer": q.get("answer", ""),
            "ai_key_points": json.dumps(q.get("key_points", [])),
            "ai_intent": q.get("interviewer_intent", ""),
        }
        for q in ranked_questions
    ]
    if question_rows and not skip_persist:
        db.table("assessment_questions").insert(question_rows).execute()

    # Courses
    course_rows = []
    for skill, course_list in courses.items():
        for c in course_list:
            course_rows.append({
                "id": str(uuid.uuid4()),
                "assessment_id": assessment_id,
                "skill_gap": skill,
                "course_title": c["title"],
                "platform": c["platform"],
                "course_url": c["url"],
                "is_free": c.get("free", False),
                "thumbnail": c.get("thumbnail"),
            })
    if course_rows and not skip_persist:
        db.table("assessment_courses").insert(course_rows).execute()

    # ── 8. Auto-generate roadmap (optional) ─────────────────────────────────
    if not skip_persist:
        _generate_roadmap(db, user_id, assessment_id, gap["missing_required"], courses)

    # ── 9. Return full result ────────────────────────────────────────────────
    return _build_result(
        assessment_id, user_id, target_role, now,
        profile, gap, ranked_questions, courses
    )


def _generate_roadmap(db, user_id: str, assessment_id: str, missing_skills: list[str], courses: dict):
    """Auto-create roadmap milestones from skill gaps."""
    # Clear old pending milestones for this user
    db.table("roadmap").delete().eq("user_id", user_id).eq("status", "pending").execute()

    rows = []
    today = datetime.utcnow()
    for i, skill in enumerate(missing_skills):
        top_course_info = courses.get(skill, [{}])[0]
        top_course = top_course_info.get("title", "")
        top_course_url = top_course_info.get("url", "")
        rows.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "assessment_id": assessment_id,
            "milestone_title": f"Learn {skill}",
            "description": f"Complete a course on {skill}." + (f" Recommended: {top_course}" if top_course else ""),
            "target_date": (today + timedelta(weeks=(i + 1) * 2)).date().isoformat(),
            "status": "pending",
            "order_index": i + 1,
            "course_url": top_course_url,
        })

    rows.append({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "assessment_id": assessment_id,
        "milestone_title": "Re-assess your readiness",
        "description": "Upload your updated resume and run a new analysis to track improvement.",
        "target_date": (today + timedelta(weeks=(len(missing_skills) + 1) * 2)).date().isoformat(),
        "status": "pending",
        "order_index": len(missing_skills) + 1,
    })

    if rows:
        db.table("roadmap").insert(rows).execute()


def _build_result(
    assessment_id, user_id, target_role, created_at,
    profile, gap, questions, courses
) -> dict:
    skills_out = []
    for s in gap["required"]:
        skills_out.append({
            "name": s,
            "status": "present" if s in gap["matched_required"] else "missing",
            "is_required": True,
        })
    for s in gap.get("matched_good_to_have", []):
        skills_out.append({"name": s, "status": "present", "is_required": False})

    return {
        "id": assessment_id,
        "user_id": user_id,
        "target_role": target_role,
        "created_at": created_at,
        "readiness_score": gap["readiness_score"],
        "profile": {
            "name": profile.get("name"),
            "email": profile.get("email"),
            "phone": profile.get("phone"),
            "education": profile.get("education", []),
            "skills": profile.get("skills", []),
            "projects": profile.get("projects", []),
            "certifications": profile.get("certifications", []),
        },
        "skills": skills_out,
        "questions": questions,
        "courses": courses,
        "roadmap_generated": True,
    }


def get_assessment(assessment_id: str, user_id: str) -> dict:
    """Fetch a stored assessment with all related data."""
    db = get_admin_supabase()

    row = db.table("assessments").select("*").eq("id", assessment_id).eq("user_id", user_id).execute()
    if not row.data:
        raise HTTPException(status_code=404, detail="Assessment not found")
    a = row.data[0]

    skills = db.table("assessment_skills").select("*").eq("assessment_id", assessment_id).execute().data
    questions = db.table("assessment_questions").select("*").eq("assessment_id", assessment_id).execute().data
    raw_courses = db.table("assessment_courses").select("*").eq("assessment_id", assessment_id).execute().data

    # Regroup courses by skill
    courses: dict = {}
    for c in raw_courses:
        skill = c["skill_gap"]
        courses.setdefault(skill, []).append({
            "title": c["course_title"],
            "platform": c["platform"],
            "url": c["course_url"],
            "free": c.get("is_free", False),
            "thumbnail": c.get("thumbnail"),
        })

    # Fetch profile from latest parse (stored inline in assessments)
    return {
        "id": a["id"],
        "user_id": a["user_id"],
        "target_role": a["target_role"],
        "job_description_text": a.get("job_description_text"),
        "created_at": a["created_at"],
        "readiness_score": a["readiness_score"],
        "skills": [
            {
                "name": s["skill_name"],
                "status": s["status"],
                "is_required": s.get("is_required", True),
            }
            for s in skills
        ],
        "questions": [
            {
                "question": q["question_text"],
                "category": q["category"],
                "skill": q.get("skill"),
                "relevance_score": q.get("relevance_score"),
                "is_gap": q.get("is_gap", False),
                "answer": q.get("ai_answer", ""),
                "key_points": q.get("ai_key_points") and (q.get("ai_key_points") if isinstance(q.get("ai_key_points"), list) else __import__('json').loads(q.get("ai_key_points"))) or [],
                "interviewer_intent": q.get("ai_intent", ""),
            }
            for q in questions
        ],
        "courses": courses,
        "profile": a.get("profile_json") or {}
    }


def get_history(user_id: str) -> list[dict]:
    """Return summary of all assessments for a user."""
    db = get_admin_supabase()
    rows = (
        db.table("assessments")
        .select("id, target_role, readiness_score, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
        .data
    )
    result = []
    for a in rows:
        skills = db.table("assessment_skills").select("status").eq("assessment_id", a["id"]).execute().data
        matched = sum(1 for s in skills if s["status"] == "present")
        missing = sum(1 for s in skills if s["status"] == "missing")
        result.append({
            **a,
            "skills_matched": matched,
            "skills_missing": missing,
        })
    return result
