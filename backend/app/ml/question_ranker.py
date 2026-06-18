"""
Question Ranker — uses a pre-trained cross-encoder to score
each candidate question against the user's profile and re-rank
the final question set by relevance.
"""

_ranker = None


def _get_ranker():
    global _ranker
    if _ranker is None:
        from sentence_transformers import CrossEncoder
        _ranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    return _ranker


def rank_questions(
    questions: list[dict],
    profile: dict,
    role: str,
) -> list[dict]:
    """
    Score each question against the candidate profile using a cross-encoder,
    then sort by score within each category.

    profile_text is constructed from skills, projects, and role.
    """
    if not questions:
        return questions

    try:
        ranker = _get_ranker()

        # Build a compact profile summary for scoring
        skills_str = ", ".join(profile.get("skills", []))
        projects_str = ", ".join(profile.get("projects", [])[:4])
        profile_text = (
            f"Candidate applying for {role}. "
            f"Known skills: {skills_str}. "
            f"Projects: {projects_str}."
        )

        pairs = [(profile_text, q["question"]) for q in questions]
        scores = ranker.predict(pairs)

        from scipy.special import expit
        for q, score in zip(questions, scores):
            # Convert raw logit to probability between 0 and 1
            prob = expit(float(score))
            q["relevance_score"] = round(float(prob), 4)

        # Sort within each category by score
        by_category: dict[str, list[dict]] = {}
        for q in questions:
            cat = q.get("category", "technical")
            by_category.setdefault(cat, []).append(q)

        ordered = []
        for cat in ["technical", "project", "scenario"]:
            cat_qs = sorted(by_category.get(cat, []), key=lambda x: x.get("relevance_score", 0), reverse=True)
            ordered.extend(cat_qs)

        return ordered

    except Exception:
        # If ranker fails (e.g., no internet for first download), return as-is
        for q in questions:
            q.setdefault("relevance_score", 0.5)
        return questions
