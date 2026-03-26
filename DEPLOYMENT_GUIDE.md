# VidyAI Deployment Guide

## Step 1: Push to GitHub
```bash
git init && git add . && git commit -m "VidyAI" && git remote add origin https://github.com/YOU/vidyai.git && git push -u origin main
```

## Step 2: Supabase Setup
1. Create project at supabase.com
2. Run SQL schema in SQL Editor
3. Create "textbooks" storage bucket
4. Note: Project URL, anon key, service_role key

## Step 3: API Keys
- Groq: console.groq.com → API Keys
- OCR.space: ocr.space/ocrapi/freekey

## Step 4: Deploy Backend (Railway)
1. railway.app → New Project → Deploy from GitHub
2. Root Directory: backend
3. Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1
4. Variables: SUPABASE_URL, SUPABASE_SERVICE_KEY, GROQ_API_KEY, OCR_SPACE_KEY, GROQ_MODEL=llama-3.3-70b-versatile, CHROMA_PERSIST_DIR=./chroma_db, MODEL_NAME=all-MiniLM-L6-v2, COST_PER_1K_TOKENS=0.0000059, ALLOWED_ORIGINS=https://your-app.vercel.app

## Step 5: Deploy Frontend (Vercel)
1. vercel.com → Import repo
2. Framework: Vite, Root: frontend
3. Variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=https://your-railway-url

## Step 6: Connect
1. Update Railway ALLOWED_ORIGINS with Vercel URL
2. Update Supabase Auth Site URL + Redirect URLs
3. For Google OAuth: add Vercel URL to Google Cloud Console origins

## Step 7: Google Sign-In
1. Supabase → Auth → Providers → Google → Enable
2. Google Cloud Console → Create OAuth Client
3. Origins: https://your-vercel.app
4. Redirect: https://xxx.supabase.co/auth/v1/callback
5. Paste Client ID + Secret in Supabase
