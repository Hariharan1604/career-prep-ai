import uuid
import random
import json
from datetime import datetime
from supabase import Client
from app.database import get_supabase
from app.ml.assessment_bank import ASSESSMENT_QUESTIONS

def _get_user_skills(user_id: str, supabase: Client):
    # Fetch the most recent analysis to get user's skill gaps
    result = supabase.table("assessments") \
        .select("id") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()
    
    if not result.data:
        return []
        
    analysis_id = result.data[0]["id"]
    skills_result = supabase.table("assessment_skills") \
        .select("skill_name, status") \
        .eq("assessment_id", analysis_id) \
        .execute()
        
    return [s["skill_name"] for s in skills_result.data]

def generate_assessment(user_id: str):
    supabase = get_supabase()
    user_skills = _get_user_skills(user_id, supabase)
    
    # If no skills found, use a default set of common skills to test
    if not user_skills:
        user_skills = ["Python", "SQL", "Machine Learning"]
        
    # Pick questions from the bank based on user skills
    selected_questions = []
    
    # Filter available skills from bank
    available_skills = [s for s in user_skills if s in ASSESSMENT_QUESTIONS]
    if not available_skills:
        available_skills = list(ASSESSMENT_QUESTIONS.keys())[:3]
        
    # Get questions
    for skill in available_skills:
        skill_qs = ASSESSMENT_QUESTIONS[skill]
        # Pick 2-3 questions per skill
        num_to_pick = min(3, len(skill_qs))
        picked = random.sample(skill_qs, num_to_pick)
        for q in picked:
            q_copy = q.copy()
            q_copy["skill_area"] = skill
            selected_questions.append(q_copy)
            
    # Shuffle and trim to 10 questions
    random.shuffle(selected_questions)
    selected_questions = selected_questions[:10]
    
    # Create DB record
    test_id = str(uuid.uuid4())
    supabase.table("assessment_tests").insert({
        "id": test_id,
        "user_id": user_id,
        "title": f"Skill Assessment - {datetime.now().strftime('%b %d, %Y')}",
        "total_questions": len(selected_questions),
        "status": "in_progress"
    }).execute()
    
    # Insert questions
    db_questions = []
    return_questions = []
    for q in selected_questions:
        q_id = str(uuid.uuid4())
        db_questions.append({
            "id": q_id,
            "test_id": test_id,
            "question_text": q["question"],
            "options": q["options"],
            "correct_option": q["correct"],
            "skill_area": q["skill_area"],
            "explanation": q["explanation"]
        })
        return_questions.append({
            "id": q_id,
            "question_text": q["question"],
            "options": q["options"],
            "skill_area": q["skill_area"]
        })
        
    if db_questions:
        supabase.table("assessment_test_answers").insert(db_questions).execute()
        
    return {
        "id": test_id,
        "title": f"Skill Assessment - {datetime.now().strftime('%b %d, %Y')}",
        "questions": return_questions
    }

def submit_assessment(test_id: str, user_id: str, answers: dict):
    supabase = get_supabase()
    
    # Get test answers from DB
    result = supabase.table("assessment_test_answers") \
        .select("*") \
        .eq("test_id", test_id) \
        .execute()
        
    db_answers = result.data
    if not db_answers:
        raise ValueError("Assessment not found")
        
    correct_count = 0
    results = []
    
    for db_ans in db_answers:
        q_id = db_ans["id"]
        selected = answers.get(q_id)
        
        is_correct = selected == db_ans["correct_option"]
        if is_correct:
            correct_count += 1
            
        # Update DB
        supabase.table("assessment_test_answers").update({
            "selected_option": selected,
            "is_correct": is_correct
        }).eq("id", q_id).execute()
        
        results.append({
            "question_id": q_id,
            "question_text": db_ans["question_text"],
            "options": db_ans["options"],
            "correct_option": db_ans["correct_option"],
            "selected_option": selected,
            "is_correct": is_correct,
            "explanation": db_ans["explanation"],
            "skill_area": db_ans["skill_area"]
        })
        
    total = len(db_answers)
    score = (correct_count / total) * 100 if total > 0 else 0
    
    # Update test record
    supabase.table("assessment_tests").update({
        "status": "completed",
        "correct_answers": correct_count,
        "score": score
    }).eq("id", test_id).execute()
    
    return {
        "id": test_id,
        "score": score,
        "total_questions": total,
        "correct_answers": correct_count,
        "answers": results
    }

def get_assessment_history(user_id: str):
    supabase = get_supabase()
    result = supabase.table("assessment_tests") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .execute()
        
    return result.data

def get_assessment_detail(test_id: str, user_id: str):
    supabase = get_supabase()
    
    test_res = supabase.table("assessment_tests").select("*").eq("id", test_id).eq("user_id", user_id).execute()
    if not test_res.data:
        raise ValueError("Assessment not found")
        
    ans_res = supabase.table("assessment_test_answers").select("*").eq("test_id", test_id).execute()
    
    test_data = test_res.data[0]
    answers = ans_res.data
    
    results = []
    for ans in answers:
        results.append({
            "question_id": ans["id"],
            "question_text": ans["question_text"],
            "options": ans["options"],
            "correct_option": ans["correct_option"],
            "selected_option": ans["selected_option"],
            "is_correct": ans["is_correct"],
            "explanation": ans["explanation"],
            "skill_area": ans["skill_area"]
        })
        
    return {
        "id": test_data["id"],
        "score": test_data["score"],
        "total_questions": test_data["total_questions"],
        "correct_answers": test_data["correct_answers"],
        "answers": results
    }
