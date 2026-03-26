# VidyAI — Intelligent Tutor for Rural India

> Intel AI Challenge 2026 — PS1: Context Pruning

## Problem
250M rural Indian students lack quality teachers. AI tutoring costs ₹0.42/query — unaffordable for govt schools.

## Solution — Context Pruning
Instead of sending entire textbook (~84,000 tokens) to LLM, VidyAI embeds the question, searches ChromaDB for top 3 relevant chunks (~600 tokens), sends only those. **94% cost reduction: ₹0.003/query.**

## Features
- Smart PDF Upload (OCR.space for custom-font PDFs)
- AI Chapter Detection (TOC parsing + Groq LLM)
- Ask AI with Context Pruning (real-time token comparison)
- Quiz Engine (MCQ + short answer, fuzzy matching)
- Chapter Learning (teaching, summaries, exam notes, flashcards)
- Answer Evaluator (AI-scored feedback)
- Study Plan (auto-generated with revision + quiz checkpoints)
- Multilingual (English, Hindi, Marathi, Tamil)
- Auto Model Fallback (70B → 8B on rate limits)

## Tech Stack
React 18 + Vite + Tailwind | FastAPI | Supabase | ChromaDB | Groq (Llama 3.3 70B) | sentence-transformers | OCR.space

## Impact
| Metric | Without | With VidyAI |
|--------|---------|-------------|
| Cost/query | ₹0.42 | ₹0.003 |
| Annual cost/school | ₹7.6L | ₹5,475 |
| Saving | — | ₹7.55L/year |

## Quick Start
```bash
cd backend && pip install -r requirements.txt && cp .env.example .env && uvicorn main:app --reload --port 8000
cd frontend && npm install && cp .env.example .env && npm run dev
```

See DEPLOYMENT_GUIDE.md for full deployment.

## Team
Aditya Chippa — SRM Institute of Science and Technology
