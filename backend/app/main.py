from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.auth.router import router as auth_router
from app.analysis.router import router as analysis_router
from app.roadmap.router import router as roadmap_router
from app.assessment.router import router as assessment_router
from app.progress.router import router as progress_router
from app.export.router import router as export_router

app = FastAPI(
    title="Career Prep AI API",
    description="Backend for the AI-powered career preparation assistant.",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://career-prep-ai-two.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_router)
app.include_router(analysis_router)
app.include_router(roadmap_router)
app.include_router(assessment_router)
app.include_router(progress_router)
app.include_router(export_router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Career Prep AI API is running"}
