# VidyAI — Complete Setup Guide
**Prerequisites:** Node.js 18+, Python 3.11+, Git, VS Code

---

## PART 1 — GET ALL API KEYS (do this first, takes ~15 minutes)

### A. Supabase — Database + Auth + Storage
1. Go to https://supabase.com → click "Start your project" → sign up with GitHub
2. Click "New project"
   - Name: vidyai
   - Database password: generate a strong one (SAVE IT)
   - Region: Southeast Asia (Singapore) — closest to India
   - Click "Create new project" — wait 2 minutes for setup
3. Once ready, go to left sidebar → "SQL Editor"
   - Paste the entire SQL schema from the `schema.sql` section below
   - Click "Run" (green button) — you should see "Success"
4. Get your keys: left sidebar → Settings → API
   - Copy "Project URL" → this is your SUPABASE_URL
   - Copy "anon public" key → this is your SUPABASE_ANON_KEY
   - Copy "service_role secret" key → this is your SUPABASE_SERVICE_KEY
   - ⚠️ IMPORTANT: SUPABASE_SERVICE_KEY is secret — NEVER put it in frontend code, NEVER commit it to GitHub, only goes in the backend .env file and Railway environment variables
5. Create storage bucket: left sidebar → Storage → New bucket
   - Name: textbooks
   - Public bucket: OFF (unchecked)
   - Click Save
6. Set auth URL: left sidebar → Authentication → URL Configuration
   - Site URL: http://localhost:5173
   - Redirect URLs: add http://localhost:5173/dashboard

### B. Google OAuth (for "Sign in with Google" button)
1. Go to https://console.cloud.google.com → sign in with your Google account
2. Click project dropdown (top bar) → "New Project"
   - Project name: VidyAI → Create
3. Left sidebar → "APIs & Services" → "OAuth consent screen"
   - User type: External → Create
   - App name: VidyAI
   - User support email: your email
   - Developer contact: your email
   - Click Save and Continue → Save and Continue → Save and Continue → Back to Dashboard
4. Left sidebar → "APIs & Services" → "Credentials"
   - Click "+ Create Credentials" → "OAuth 2.0 Client IDs"
   - Application type: Web application
   - Name: VidyAI Web
   - Authorized JavaScript origins: add http://localhost:5173
   - Authorized redirect URIs: go to your Supabase project → Authentication → Providers → Google → copy the "Callback URL (for OAuth)" → paste it here
   - Click Create
   - Copy the "Client ID" and "Client secret"
5. Back in Supabase → Authentication → Providers → Google
   - Toggle Enable: ON
   - Paste Client ID and Client Secret
   - Click Save

### C. Groq API — the LLM
1. Go to https://console.groq.com → Sign up free (no credit card needed)
2. Left sidebar → API Keys → "Create API Key"
   - Name: vidyai
   - Click Submit
   - Copy the key (starts with gsk_) — you only see it ONCE, save it immediately
   - ⚠️ This key is secret — backend .env only, never in frontend, never in GitHub

---

## PART 2 — LOCAL DEVELOPMENT SETUP

### Step 1 — Extract and open project
Open VS Code. File → Open Folder → select the extracted vidyai folder.
Open the integrated terminal: View → Terminal (or Ctrl+`)

### Step 2 — Backend setup
```bash
cd backend
pip install -r requirements.txt
```
This installs all Python packages globally. May take 5–10 minutes on first run (EasyOCR and sentence-transformers are large).

Create your environment file:
```bash
cp .env.example .env
```
Open `backend/.env` in VS Code and fill in every value:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...long key...
GROQ_API_KEY=gsk_xxxxx
CHROMA_PERSIST_DIR=./chroma_db
MODEL_NAME=all-MiniLM-L6-v2
GROQ_MODEL=llama-3.1-8b-instant
COST_PER_1K_TOKENS=0.0000059
ALLOWED_ORIGINS=http://localhost:5173
```
Save the file. Start the backend:
```bash
uvicorn main:app --reload --port 8000
```
You should see: `Uvicorn running on http://0.0.0.0:8000`
Test it: open http://localhost:8000/health in browser → should show `{"status":"ok"}`

### Step 3 — Frontend setup
Open a NEW terminal tab (+ icon in terminal panel):
```bash
cd frontend
npm install
```
Create your environment file:
```bash
cp .env.example .env
```
Open `frontend/.env` in VS Code and fill in:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...anon key...
VITE_API_URL=http://localhost:8000
```
⚠️ VITE_SUPABASE_ANON_KEY is the PUBLIC anon key — safe for frontend.
⚠️ NEVER put SUPABASE_SERVICE_KEY in the frontend .env file.

Start the frontend:
```bash
npm run dev
```
You should see: `Local: http://localhost:5173`

### Step 4 — Test everything locally
1. Open http://localhost:5173 in Chrome
2. Click "Get Started Free" → Sign Up tab → create an account
3. Check your email → click verification link → sign in
4. Upload page → drag any PDF file → watch all 7 steps animate
5. After processing → click a chapter card → Ask AI opens
6. Type a question → watch streamed response with token bar
7. Analytics page → verify cost savings cards show numbers

---

## PART 3 — DEPLOY TO PRODUCTION

### Step 5 — Push code to GitHub
```bash
git init
git add .
git commit -m "VidyAI initial commit"
```
Go to https://github.com → New repository → name: vidyai → Private → Create
Copy the push commands shown and run them.

### Step 6 — Deploy Backend to Railway
1. Go to https://railway.app → Login with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your vidyai repo
4. Once service is created, click on it → Settings tab → Root Directory: `/backend`
5. Click "Variables" tab → Add:
   ```
   SUPABASE_URL, SUPABASE_SERVICE_KEY, GROQ_API_KEY,
   CHROMA_PERSIST_DIR=./chroma_db, MODEL_NAME=all-MiniLM-L6-v2,
   GROQ_MODEL=llama-3.1-8b-instant, COST_PER_1K_TOKENS=0.0000059,
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
6. Click "Deploy" → wait 3–5 minutes
7. Copy your Railway URL (e.g. https://vidyai-api.up.railway.app)

### Step 7 — Deploy Frontend to Vercel
1. Go to https://vercel.com → Login with GitHub
2. Click "Add New" → "Project" → Import vidyai repo
3. Root Directory: `frontend`, Framework: Vite
4. Environment Variables:
   ```
   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_URL=<Railway URL>
   ```
5. Click "Deploy" → wait 2–3 minutes

### Step 8 — Final configuration
1. Update Railway `ALLOWED_ORIGINS` to include your Vercel URL
2. Supabase → Authentication → URL Configuration → update Site URL + Redirect URLs
3. Google Cloud Console → update OAuth redirect URIs

### Step 9 — Verify
1. Open your Vercel URL
2. Sign in → Upload PDF → Ask AI → Check Analytics

---

## SQL SCHEMA

Paste this in Supabase SQL Editor:

```sql
-- Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student','teacher','admin','parent')),
  class_level TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en','hi','mr','ta')),
  streak_days INTEGER DEFAULT 0,
  last_active DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name',
          COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TABLE textbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL, subject TEXT, class_level TEXT, board TEXT,
  pdf_url TEXT, total_pages INTEGER, total_chunks INTEGER DEFAULT 0,
  chapter_count INTEGER DEFAULT 0, baseline_token_count INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'pending', processing_progress INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id), is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chapters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE,
  chapter_number INTEGER, title TEXT NOT NULL,
  page_start INTEGER, page_end INTEGER, estimated_minutes INTEGER,
  topic_summary TEXT[], created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  content TEXT NOT NULL, page_number INTEGER, chunk_index INTEGER,
  token_count INTEGER, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, textbook_id)
);

CREATE TABLE quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('mcq','short_answer')),
  options JSONB, correct_answer TEXT NOT NULL, explanation TEXT,
  source_text TEXT, page_number INTEGER, difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  textbook_id UUID REFERENCES textbooks(id),
  chapter_id UUID REFERENCES chapters(id),
  questions JSONB NOT NULL, answers JSONB NOT NULL,
  score INTEGER NOT NULL, total INTEGER NOT NULL,
  time_taken_seconds INTEGER, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE,
  exam_date DATE, daily_hours NUMERIC(3,1) DEFAULT 2.0,
  plan JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, textbook_id)
);

CREATE TABLE query_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id), textbook_id UUID REFERENCES textbooks(id),
  question_preview TEXT, tokens_used INTEGER NOT NULL, tokens_baseline INTEGER NOT NULL,
  tokens_saved INTEGER GENERATED ALWAYS AS (tokens_baseline - tokens_used) STORED,
  cost_actual NUMERIC(10,6), cost_baseline NUMERIC(10,6),
  cost_saved NUMERIC(10,6) GENERATED ALWAYS AS (cost_baseline - cost_actual) STORED,
  response_time_ms INTEGER, pruning_enabled BOOLEAN DEFAULT TRUE,
  language TEXT DEFAULT 'en', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE processing_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  textbook_id UUID REFERENCES textbooks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', current_step TEXT,
  current_step_number INTEGER DEFAULT 0, total_steps INTEGER DEFAULT 7,
  progress INTEGER DEFAULT 0, steps_completed JSONB DEFAULT '[]',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE textbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "public books readable" ON textbooks FOR SELECT TO authenticated USING (is_public = true OR uploaded_by = auth.uid());
CREATE POLICY "insert books" ON textbooks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "read chapters" ON chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "read chunks" ON chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "read quiz questions" ON quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "own quiz attempts" ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own study plans" ON study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "own query logs read" ON query_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert query logs" ON query_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "read jobs" ON processing_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert jobs" ON processing_jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update jobs" ON processing_jobs FOR UPDATE TO authenticated USING (true);
```

---

## QUICK REFERENCE — WHERE EACH KEY GOES

| Key | Backend .env | Railway | Frontend .env | Vercel |
|-----|-------------|---------|---------------|--------|
| SUPABASE_URL | ✓ | ✓ | ✓ | ✓ |
| SUPABASE_SERVICE_KEY | ✓ | ✓ | ✗ NEVER | ✗ NEVER |
| SUPABASE_ANON_KEY | ✗ | ✗ | ✓ | ✓ |
| GROQ_API_KEY | ✓ | ✓ | ✗ NEVER | ✗ NEVER |
| VITE_API_URL | ✗ | ✗ | ✓ | ✓ |
