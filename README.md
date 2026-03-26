# VidyAI — Intelligent Tutoring for Every Student

**Intel AI Challenge 2026 Submission**

VidyAI is a fully deployed intelligent tutoring web application for rural Indian students. It uses **Context Pruning** — a vector-similarity-based retrieval technique — to reduce LLM API costs by **94%**, making AI-powered education affordable at scale.

## The Problem

Rural Indian schools cannot afford high-cost AI queries. GPT-4 costs ₹0.40/query — for a school of 500 students asking 10 questions/day, that's ₹2,000/day (₹7.3 lakh/year).

## The Solution: Context Pruning

Instead of sending the entire textbook to the LLM, VidyAI:
1. Embeds the student's question using `all-MiniLM-L6-v2`
2. Runs vector similarity search against pre-processed textbook chunks in ChromaDB
3. Sends only the top 2–3 relevant paragraphs (~600 tokens) instead of the full book (~84,000 tokens)

**Result:** ₹0.003/query instead of ₹0.42/query — **94% cost reduction**.

## Architecture

```
┌─────────────┐     ┌───────────────┐     ┌──────────────┐
│  React SPA  │────▶│  FastAPI API   │────▶│  Supabase    │
│  (Vercel)   │     │  (Railway)     │     │  (PostgreSQL)│
└─────────────┘     └───────┬───────┘     └──────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
        ┌─────▼────┐  ┌────▼─────┐  ┌───▼────┐
        │ ChromaDB │  │ MiniLM   │  │ Groq   │
        │ Vectors  │  │ Embedder │  │ LLM    │
        └──────────┘  └──────────┘  └────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Auth | Supabase Auth (Google OAuth + Email) |
| Database | Supabase PostgreSQL |
| Backend | FastAPI (Python 3.11) |
| Embeddings | sentence-transformers `all-MiniLM-L6-v2` |
| Vector Store | ChromaDB (persistent) |
| OCR | PyMuPDF + EasyOCR (Hindi/Marathi/English) |
| LLM | Groq `llama-3.1-8b-instant` (streaming) |
| Deploy | Vercel (frontend) + Railway (backend) |

## Features

1. **Smart PDF Upload** — OCR for scanned PDFs, auto chapter detection, 7-step async processing
2. **Ask AI with Context Pruning** — SSE streaming, token comparison bar, source citations
3. **Study Plan Generator** — Calendar/list view, streak tracking, exam date targeting
4. **Quiz Engine** — MCQ + short answer, page range selection, instant scoring
5. **Progress Dashboard** — Streak, quiz history charts, weak areas
6. **Analytics Dashboard** — Live cost savings, pruning ON/OFF simulation, school stats
7. **Voice Mode** — Speech-to-text + TTS in 4 Indian languages
8. **PWA** — Installable on any device
9. **Dark Mode** — Full theme support

## Setup

See `SETUP_GUIDE.md` for complete instructions.

## For Judges

See `JUDGE_GUIDE.md` for the recommended evaluation flow.

---

*Built with ❤️ for Bharat · Intel AI Challenge 2026*
