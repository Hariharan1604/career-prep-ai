import json
import os
import re
import pdfplumber
from typing import Optional

# ── Known skills master list for keyword extraction ─────────────────────────
SKILLS_MASTER = [
    "Python", "Java", "JavaScript", "TypeScript", "C", "C++", "C#", "Go",
    "Ruby", "PHP", "Swift", "Kotlin", "Rust", "Scala", "R",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle",
    "HTML", "CSS", "React", "Vue.js", "Angular", "Next.js", "Node.js",
    "Django", "Flask", "FastAPI", "Spring Boot", "Express.js",
    "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "OpenCV",
    "Pandas", "NumPy", "Matplotlib", "Seaborn", "Plotly",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "Data Visualization", "Statistics", "Data Cleaning", "Data Preprocessing",
    "Power BI", "Tableau", "Excel", "Word", "PowerPoint",
    "Git", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
    "Linux", "Shell Scripting", "CI/CD", "Terraform", "Ansible",
    "REST APIs", "GraphQL", "Microservices", "OOP",
    "Figma", "Photoshop", "Illustrator",
    "JUnit", "Hibernate", "Maven", "Gradle",
    "Redis", "Kafka", "RabbitMQ", "Celery",
    "Tailwind CSS", "Bootstrap", "SASS",
    "Data Structures", "Algorithms", "Design Patterns",
    "Authentication", "OAuth", "JWT", "Networking", "Security",
    "Agile", "Scrum", "JIRA", "Unit Testing", "Selenium",
]

# ── Section header keywords ──────────────────────────────────────────────────
SECTION_PATTERNS = {
    "education": re.compile(
        r"^(education|academic|qualification|degree|schooling)", re.I
    ),
    "experience": re.compile(
        r"^(experience|employment|work history|professional|internship|career)", re.I
    ),
    "skills": re.compile(
        r"^(skills|technical skills|skill set|competencies|technologies|tools|expertise)", re.I
    ),
    "projects": re.compile(
        r"^(projects|academic projects|personal projects|project work|portfolio)", re.I
    ),
    "certifications": re.compile(
        r"^(certif|courses|training|awards|achievements|licenses)", re.I
    ),
    "summary": re.compile(
        r"^(summary|objective|profile|about|overview)", re.I
    ),
}

# ── Alias map ────────────────────────────────────────────────────────────────
_ALIAS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "skill_aliases.json")
with open(_ALIAS_PATH, encoding="utf-8") as f:
    SKILL_ALIASES: dict = json.load(f)


def _normalize_skill(raw: str) -> str:
    """Normalize a skill string using alias map."""
    key = raw.strip().lower()
    return SKILL_ALIASES.get(key, raw.strip())


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file using pdfplumber."""
    full_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
    return "\n".join(full_text)


def detect_sections(text: str) -> dict[str, str]:
    """
    Split resume text into labeled sections using regex header detection.
    Returns a dict: { 'education': '...', 'skills': '...', ... }
    """
    lines = text.split("\n")
    sections: dict[str, list[str]] = {
        "summary": [], "education": [], "experience": [],
        "skills": [], "projects": [], "certifications": [], "other": []
    }
    current_section = "other"

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        matched = False
        for section_name, pattern in SECTION_PATTERNS.items():
            if pattern.match(stripped):
                current_section = section_name
                matched = True
                break
        if not matched:
            sections[current_section].append(stripped)

    return {k: "\n".join(v) for k, v in sections.items()}


def extract_name(text: str) -> Optional[str]:
    """Heuristic: name is usually the first non-empty line."""
    for line in text.split("\n"):
        stripped = line.strip()
        if stripped and len(stripped.split()) >= 2:
            # Avoid lines that look like section headers or contact info
            if not re.search(r"[@|:/\d]", stripped) and len(stripped) < 60:
                return stripped
    return None


def extract_email(text: str) -> Optional[str]:
    match = re.search(r"[\w.\-+]+@[\w.\-]+\.\w+", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    match = re.search(r"(\+91[\s\-]?)?[6-9]\d{9}|(\+\d{1,3}[\s\-]?)?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}", text)
    return match.group(0) if match else None


def extract_skills_from_text(text: str) -> list[str]:
    """
    Extract skills from text using:
    1. Master skill list keyword matching (case-insensitive)
    2. Alias normalization
    """
    found: set[str] = set()
    text_lower = text.lower()

    for skill in SKILLS_MASTER:
        # Build a word-boundary-aware pattern
        pattern = re.compile(r"\b" + re.escape(skill.lower()) + r"\b")
        if pattern.search(text_lower):
            found.add(skill)

    # Also scan alias keys
    for alias, canonical in SKILL_ALIASES.items():
        pattern = re.compile(r"\b" + re.escape(alias) + r"\b")
        if pattern.search(text_lower):
            found.add(canonical)

    return sorted(found)


def extract_education(text: str) -> list[dict]:
    """Extract degree, institution from education section."""
    results = []
    degree_pattern = re.compile(
        r"(B\.?Tech|B\.?E|B\.?Sc|B\.?Com|B\.?A|M\.?Tech|M\.?E|M\.?Sc|MBA|MCA|BCA|Ph\.?D)[^,\n]{0,60}",
        re.I,
    )
    for match in degree_pattern.finditer(text):
        results.append({"degree": match.group(0).strip()})
    return results


def extract_projects(text: str) -> list[str]:
    """Extract project names from projects section."""
    projects = []
    for line in text.split("\n"):
        stripped = line.strip()
        # Project names tend to be short title-cased or ALL-CAPS lines
        if 5 < len(stripped) < 100 and not stripped.endswith(":"):
            if stripped[0].isupper() or stripped.isupper():
                projects.append(stripped)
    return projects[:8]  # Cap at 8 projects


def parse_resume(pdf_path: str) -> dict:
    """
    Full resume parsing pipeline.
    Returns structured candidate profile.
    """
    raw_text = extract_text_from_pdf(pdf_path)
    sections = detect_sections(raw_text)

    name = extract_name(raw_text)
    email = extract_email(raw_text)
    phone = extract_phone(raw_text)

    # Extract skills from dedicated skills section first, then full text
    skills_text = sections["skills"] + "\n" + sections["experience"] + "\n" + sections["projects"]
    skills = extract_skills_from_text(skills_text)

    education = extract_education(sections["education"])
    projects = extract_projects(sections["projects"])
    certifications = [
        line.strip() for line in sections["certifications"].split("\n")
        if line.strip() and len(line.strip()) > 5
    ]

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "education": education,
        "skills": skills,
        "projects": projects,
        "certifications": certifications[:6],
        "raw_sections": sections,
    }
