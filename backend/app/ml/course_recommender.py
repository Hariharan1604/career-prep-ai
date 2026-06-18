"""
Course Recommender — fetches live course suggestions from:
  Priority 1: YouTube Data API (free video tutorials)
  Priority 2: Curated search URLs for Coursera & Udemy
  Priority 3: Static fallback descriptions
"""
import os
import urllib.parse
from typing import Optional
import requests
from app.config import settings


# ── Static course descriptions per skill (fallback) ─────────────────────────
STATIC_COURSES: dict[str, list[dict]] = {
    "SQL": [
        {"title": "SQL for Data Science", "platform": "Coursera", "url": "https://www.coursera.org/learn/sql-for-data-science", "free": False},
        {"title": "The Complete SQL Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/course/the-complete-sql-bootcamp/", "free": False},
        {"title": "SQLZoo Interactive Tutorial", "platform": "SQLZoo", "url": "https://sqlzoo.net/", "free": True},
    ],
    "Python": [
        {"title": "Python for Everybody", "platform": "Coursera", "url": "https://www.coursera.org/specializations/python", "free": False},
        {"title": "Automate the Boring Stuff with Python", "platform": "Free Book", "url": "https://automatetheboringstuff.com/", "free": True},
        {"title": "Python Bootcamp – Zero to Hero", "platform": "Udemy", "url": "https://www.udemy.com/course/complete-python-bootcamp/", "free": False},
    ],
    "Machine Learning": [
        {"title": "Machine Learning Specialization", "platform": "Coursera", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "free": False},
        {"title": "Fast.ai – Practical Deep Learning", "platform": "fast.ai", "url": "https://course.fast.ai/", "free": True},
        {"title": "ML A-Z: AI, Python & R", "platform": "Udemy", "url": "https://www.udemy.com/course/machinelearning/", "free": False},
    ],
    "Deep Learning": [
        {"title": "Deep Learning Specialization", "platform": "Coursera", "url": "https://www.coursera.org/specializations/deep-learning", "free": False},
        {"title": "Fast.ai Part 2", "platform": "fast.ai", "url": "https://course.fast.ai/Lessons/part2.html", "free": True},
    ],
    "Power BI": [
        {"title": "Microsoft Power BI Desktop", "platform": "Udemy", "url": "https://www.udemy.com/course/microsoft-power-bi-up-running-with-power-bi-desktop/", "free": False},
        {"title": "Power BI – Microsoft Learn", "platform": "Microsoft Learn", "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "free": True},
    ],
    "Statistics": [
        {"title": "Statistics with Python", "platform": "Coursera", "url": "https://www.coursera.org/specializations/statistics-with-python", "free": False},
        {"title": "Khan Academy – Statistics", "platform": "Khan Academy", "url": "https://www.khanacademy.org/math/statistics-probability", "free": True},
    ],
    "Data Visualization": [
        {"title": "Data Visualization with Python", "platform": "Coursera", "url": "https://www.coursera.org/learn/python-for-data-visualization", "free": False},
        {"title": "Tableau Training", "platform": "Tableau", "url": "https://www.tableau.com/learn/training", "free": True},
    ],
    "React": [
        {"title": "React – The Complete Guide", "platform": "Udemy", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "free": False},
        {"title": "React Official Docs Tutorial", "platform": "React.dev", "url": "https://react.dev/learn", "free": True},
    ],
    "Docker": [
        {"title": "Docker & Kubernetes: The Practical Guide", "platform": "Udemy", "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", "free": False},
        {"title": "Docker Official Get Started", "platform": "Docker Docs", "url": "https://docs.docker.com/get-started/", "free": True},
    ],
    "Kubernetes": [
        {"title": "Kubernetes for Beginners", "platform": "Udemy", "url": "https://www.udemy.com/course/learn-kubernetes/", "free": False},
        {"title": "Kubernetes – Kodekloud", "platform": "KodeKloud", "url": "https://kodekloud.com/courses/kubernetes-for-the-absolute-beginners/", "free": False},
    ],
    "AWS": [
        {"title": "AWS Certified Cloud Practitioner", "platform": "Udemy", "url": "https://www.udemy.com/course/aws-certified-cloud-practitioner-new/", "free": False},
        {"title": "AWS Training & Certification", "platform": "AWS", "url": "https://aws.amazon.com/training/", "free": True},
    ],
    "Git": [
        {"title": "Git & GitHub Crash Course", "platform": "Udemy", "url": "https://www.udemy.com/course/git-and-github-bootcamp/", "free": False},
        {"title": "Pro Git Book", "platform": "Free Book", "url": "https://git-scm.com/book/en/v2", "free": True},
    ],
    "REST APIs": [
        {"title": "REST APIs with Flask and Python", "platform": "Udemy", "url": "https://www.udemy.com/course/rest-api-flask-and-python/", "free": False},
        {"title": "FastAPI Official Tutorial", "platform": "FastAPI Docs", "url": "https://fastapi.tiangolo.com/tutorial/", "free": True},
    ],
    "TypeScript": [
        {"title": "TypeScript: The Complete Developer's Guide", "platform": "Udemy", "url": "https://www.udemy.com/course/typescript-the-complete-developers-guide/", "free": False},
        {"title": "TypeScript Official Handbook", "platform": "TypeScript Docs", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "free": True},
    ],
    "Java": [
        {"title": "Java Programming Masterclass", "platform": "Udemy", "url": "https://www.udemy.com/course/java-the-complete-java-developer-course/", "free": False},
        {"title": "Java – MOOC Helsinki", "platform": "mooc.fi", "url": "https://java-programming.mooc.fi/", "free": True},
    ],
    "Spring Boot": [
        {"title": "Spring Boot 3 & Spring Framework 6", "platform": "Udemy", "url": "https://www.udemy.com/course/spring-hibernate-tutorial/", "free": False},
    ],
    "CI/CD": [
        {"title": "DevOps with Docker and Kubernetes", "platform": "Udemy", "url": "https://www.udemy.com/course/devops-with-docker/", "free": False},
        {"title": "GitHub Actions Documentation", "platform": "GitHub", "url": "https://docs.github.com/en/actions", "free": True},
    ],
    "Linux": [
        {"title": "Linux Command Line Basics", "platform": "Udemy", "url": "https://www.udemy.com/course/linux-command-line-volume1/", "free": False},
        {"title": "Linux Journey", "platform": "linuxjourney.com", "url": "https://linuxjourney.com/", "free": True},
    ],
    "Django": [
        {"title": "Django 4 & Python: The Ultimate Web Development Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/course/django-and-python-full-stack-developer-masterclass/", "free": False},
        {"title": "Django Official Tutorial", "platform": "Django Docs", "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/", "free": True},
    ],
    "Flask": [
        {"title": "REST APIs with Flask and Python", "platform": "Udemy", "url": "https://www.udemy.com/course/rest-api-flask-and-python/", "free": False},
        {"title": "Flask Mega-Tutorial", "platform": "Blog", "url": "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world", "free": True},
    ],
}


def _get_youtube_courses(skill: str, max_results: int = 2) -> list[dict]:
    """Fetch YouTube tutorial videos for a skill using the Data API."""
    if not settings.YOUTUBE_API_KEY:
        return []

    query = urllib.parse.quote(f"{skill} tutorial for beginners")
    url = (
        f"https://www.googleapis.com/youtube/v3/search"
        f"?part=snippet&q={query}&type=video&maxResults={max_results}"
        f"&key={settings.YOUTUBE_API_KEY}&videoDuration=medium"
    )
    try:
        resp = requests.get(url, timeout=5)
        data = resp.json()
        results = []
        for item in data.get("items", []):
            snippet = item["snippet"]
            video_id = item["id"]["videoId"]
            results.append({
                "title": snippet["title"],
                "platform": "YouTube",
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "thumbnail": snippet["thumbnails"]["medium"]["url"],
                "free": True,
                "channel": snippet["channelTitle"],
            })
        return results
    except Exception:
        return []


def _get_search_urls(skill: str) -> list[dict]:
    """Generate direct search links to Coursera and Udemy."""
    encoded = urllib.parse.quote(skill)
    return [
        {
            "title": f'Search "{skill}" on Coursera',
            "platform": "Coursera",
            "url": f"https://www.coursera.org/search?query={encoded}",
            "free": False,
            "is_search": True,
        },
        {
            "title": f'Search "{skill}" on Udemy',
            "platform": "Udemy",
            "url": f"https://www.udemy.com/courses/search/?q={encoded}&sort=relevance",
            "free": False,
            "is_search": True,
        },
    ]


def recommend_courses(missing_skills: list[str]) -> dict[str, list[dict]]:
    """
    For each missing skill, return up to 3 course recommendations.
    Priority: static curated > YouTube API > search URLs.
    """
    recommendations: dict[str, list[dict]] = {}

    for skill in missing_skills:
        courses: list[dict] = []

        # 1. Static curated
        if skill in STATIC_COURSES:
            courses.extend(STATIC_COURSES[skill][:2])

        # 2. YouTube API
        yt_courses = _get_youtube_courses(skill, max_results=1)
        courses.extend(yt_courses)

        # 3. Fill with search URLs if still short
        if len(courses) < 2:
            courses.extend(_get_search_urls(skill)[:2 - len(courses)])

        recommendations[skill] = courses[:3]

    return recommendations
