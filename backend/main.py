import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import auth, textbooks, query, quiz, study_plan, analytics, profile, content

app = FastAPI(
    title="VidyAI API",
    description="Intelligent tutoring backend with Context Pruning for the Intel AI Challenge 2026",
    version="1.0.0"
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(textbooks.router)
app.include_router(query.router)
app.include_router(quiz.router)
app.include_router(study_plan.router)
app.include_router(analytics.router)
app.include_router(profile.router)
app.include_router(content.router)


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "VidyAI API", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "message": "VidyAI API — Intel AI Challenge 2026",
        "docs": "/docs",
        "health": "/health"
    }
