from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# ── Auth ──
class UserProfile(BaseModel):
    id: str
    full_name: Optional[str] = None
    role: str = "student"
    class_level: Optional[str] = None
    language: str = "en"
    streak_days: int = 0
    avatar_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    class_level: Optional[str] = None
    language: Optional[str] = None
    avatar_url: Optional[str] = None


# ── Textbooks ──
class TextbookUpload(BaseModel):
    title: str
    subject: Optional[str] = None
    class_level: Optional[str] = None
    board: Optional[str] = None


class TextbookResponse(BaseModel):
    id: str
    title: str
    subject: Optional[str] = None
    class_level: Optional[str] = None
    board: Optional[str] = None
    pdf_url: Optional[str] = None
    total_pages: Optional[int] = None
    total_chunks: int = 0
    chapter_count: int = 0
    baseline_token_count: int = 0
    processing_status: str = "pending"
    processing_progress: int = 0
    is_public: bool = True
    created_at: Optional[str] = None


class ChapterResponse(BaseModel):
    id: str
    textbook_id: str
    chapter_number: int
    title: str
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    estimated_minutes: Optional[int] = None
    topic_summary: Optional[List[str]] = None


# ── Query ──
class AskRequest(BaseModel):
    question: str
    textbook_id: str
    pruning_enabled: bool = True
    language: str = "en"


# ── Quiz ──
class QuizGenerateRequest(BaseModel):
    textbook_id: str
    chapter_id: Optional[str] = None
    page_start: Optional[int] = None
    page_end: Optional[int] = None
    question_type: str = "mixed"
    difficulty: str = "medium"
    language: str = "en"
    count: int = 10


class QuizSubmitRequest(BaseModel):
    textbook_id: str
    chapter_id: Optional[str] = None
    questions: list
    answers: list
    score: int
    total: int
    time_taken_seconds: Optional[int] = None


class QuizQuestionResponse(BaseModel):
    id: str
    question: str
    question_type: str
    options: Optional[list] = None
    correct_answer: str
    explanation: Optional[str] = None
    source_text: Optional[str] = None
    page_number: Optional[int] = None
    difficulty: str = "medium"


# ── Study Plan ──
class StudyPlanGenerate(BaseModel):
    textbook_id: str
    exam_date: Optional[date] = None
    daily_hours: float = 2.0


class StudyPlanResponse(BaseModel):
    id: str
    textbook_id: str
    exam_date: Optional[date] = None
    daily_hours: float = 2.0
    plan: list = []


# ── Analytics ──
class AnalyticsSummary(BaseModel):
    total_queries_today: int = 0
    total_tokens_saved: int = 0
    total_cost_saved_inr: float = 0.0
    avg_cost_per_query_inr: float = 0.0
    avg_response_time_ms: int = 0
    total_students: int = 0
    active_today: int = 0
    total_books: int = 0


class DailyCost(BaseModel):
    date: str
    baseline_cost: float
    vidyai_cost: float


# ── Processing Jobs ──
class JobStatus(BaseModel):
    id: str
    textbook_id: str
    status: str = "pending"
    current_step: Optional[str] = None
    current_step_number: int = 0
    total_steps: int = 7
    progress: int = 0
    steps_completed: list = []
    error_message: Optional[str] = None
