import json
import os
import numpy as np
from typing import Optional

# Lazy imports — loaded once on first use
_sentence_model = None
_skill_embeddings: Optional[np.ndarray] = None
_skill_labels: Optional[list[str]] = None

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def _get_sentence_model():
    global _sentence_model
    if _sentence_model is None:
        from sentence_transformers import SentenceTransformer
        _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _sentence_model


def _get_all_skills() -> list[str]:
    """Collect all unique skills across all roles."""
    path = os.path.join(DATA_DIR, "role_skills.json")
    with open(path, encoding="utf-8") as f:
        roles = json.load(f)
    skills: set[str] = set()
    for role_data in roles.values():
        skills.update(role_data["required"])
        skills.update(role_data["good_to_have"])
    return sorted(skills)


def _build_skill_index():
    """Pre-compute embeddings for all skills and cache them in memory."""
    global _skill_embeddings, _skill_labels
    model = _get_sentence_model()
    _skill_labels = _get_all_skills()
    raw_embeddings = model.encode(_skill_labels, convert_to_numpy=True, show_progress_bar=False)

    # Normalize for cosine similarity
    norms = np.linalg.norm(raw_embeddings, axis=1, keepdims=True)
    _skill_embeddings = raw_embeddings / norms
    return _skill_embeddings, _skill_labels


def get_skill_index():
    global _skill_embeddings, _skill_labels
    if _skill_embeddings is None or _skill_labels is None:
        _build_skill_index()
    return _skill_embeddings, _skill_labels


def normalize_skills(raw_skills: list[str]) -> list[str]:
    """
    Normalize a list of raw skill strings:
    1. Load alias map
    2. Title-case
    3. Deduplicate
    """
    alias_path = os.path.join(DATA_DIR, "skill_aliases.json")
    with open(alias_path, encoding="utf-8") as f:
        aliases = json.load(f)

    normalized: set[str] = set()
    for skill in raw_skills:
        key = skill.strip().lower()
        canonical = aliases.get(key, skill.strip())
        normalized.add(canonical)
    return sorted(normalized)


def semantic_skill_match(
    resume_sentences: list[str],
    candidate_skills: list[str],
    threshold: float = 0.72,
) -> list[str]:
    """
    Use Sentence-BERT cosine similarity to detect skills implied in
    resume text but not explicitly mentioned (e.g., "built charts in
    Matplotlib" → "Data Visualization").

    Returns additional skills inferred semantically.
    """
    model = _get_sentence_model()
    skill_embeddings, skill_labels = get_skill_index()

    if not resume_sentences:
        return []

    # Encode resume sentences
    sentence_embeddings = model.encode(
        resume_sentences, convert_to_numpy=True, show_progress_bar=False
    )
    if sentence_embeddings.size == 0:
        return []

    norms = np.linalg.norm(sentence_embeddings, axis=1, keepdims=True)
    sentence_embeddings = sentence_embeddings / (norms + 1e-9)

    # Cosine similarity: (num_sentences, num_skills)
    similarities = sentence_embeddings @ skill_embeddings.T

    # Max similarity per skill across all sentences
    max_per_skill = similarities.max(axis=0)

    inferred: set[str] = set()
    for i, score in enumerate(max_per_skill):
        if score >= threshold:
            inferred.add(skill_labels[i])

    # Remove already known skills
    known_lower = {s.lower() for s in candidate_skills}
    new_skills = [s for s in inferred if s.lower() not in known_lower]
    return new_skills


def extract_skills_from_jd(jd_text: str) -> list[str]:
    """
    Extract skills from a custom Job Description text using semantic matching
    against our master database of known skills.
    """
    # Split JD into sentences or bullet points
    sentences = [s.strip() for s in jd_text.replace('\n', '.').split('.') if len(s.strip()) > 10]
    
    # We can use the existing semantic_skill_match, passing an empty candidate list
    extracted_skills = semantic_skill_match(sentences, candidate_skills=[])
    return extracted_skills


def compute_skill_gap(
    candidate_skills: list[str],
    role: str = None,
    custom_jd_skills: list[str] = None
) -> dict:
    """
    Compare candidate skills against either role requirements or custom JD skills.
    Returns: matched, missing, good_to_have_present, readiness_score
    """
    required = []
    good_to_have = []

    if custom_jd_skills is not None:
        # Custom JD flow
        required = custom_jd_skills
        good_to_have = [] # JD extraction usually yields strict requirements
    else:
        # Predefined role flow
        path = os.path.join(DATA_DIR, "role_skills.json")
        with open(path, encoding="utf-8") as f:
            roles = json.load(f)

        if role not in roles:
            raise ValueError(f"Role '{role}' not found. Available: {list(roles.keys())}")

        required = roles[role]["required"]
        good_to_have = roles[role]["good_to_have"]

    candidate_lower = {s.lower() for s in candidate_skills}

    matched_required = [r for r in required if r.lower() in candidate_lower]
    missing_required = [r for r in required if r.lower() not in candidate_lower]
    matched_good = [g for g in good_to_have if g.lower() in candidate_lower]

    base_readiness = (len(matched_required) / len(required) * 100) if required else 0.0
    
    # Bonus points for good-to-have skills (1.5% per skill)
    bonus = len(matched_good) * 1.5
    
    readiness = min(100.0, round(base_readiness + bonus, 1))

    return {
        "required": required,
        "good_to_have": good_to_have,
        "matched_required": matched_required,
        "missing_required": missing_required,
        "matched_good_to_have": matched_good,
        "readiness_score": readiness,
    }
