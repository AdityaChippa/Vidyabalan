# VidyAI — Intel AI Challenge 2026
## Evaluator's Guide

### Live Application
**URL:** https://vidyai.vercel.app
**Demo account:** demo@vidyai.in / Demo@1234
(Or create your own account — takes 30 seconds)

### Recommended Evaluation Flow

**1. Sign in** with demo account or Google

**2. Upload sample textbook**
- Go to Upload → drag `/samples/Maharashtra_Science_Std8_sample.pdf`
- Watch the 7-step processing animation (OCR, chunking, embedding, quiz generation all live)
- You can close the tab — processing continues on the server

**3. Ask AI — observe Context Pruning**
- Select uploaded book → ask "What is photosynthesis?" or any Science question
- See the token comparison bar on every response:
  - VidyAI: ~600 tokens sent
  - Baseline RAG: ~84,000 tokens would be sent
- Toggle "Pruning OFF" (top right) → ask same question → watch token count spike

**4. Take a quiz**
- Quiz tab → Custom page range (pages 40–60) → Generate
- Submit answers → see wrong answers with textbook source citations

**5. Analytics Dashboard** (Intel showpiece)
- View live cost savings counter, cost comparison charts
- Use Pruning ON/OFF simulation toggle to see dramatic cost difference visually

### The Core Technology: Context Pruning

|  | Baseline RAG | VidyAI |
|---|---|---|
| Tokens per query | ~84,300 | ~612 |
| Cost per query | ₹0.42 | ₹0.003 |
| Reduction | — | **94%** |

At 10 questions/day × 500 students:
- Baseline: ₹2,100/day → ₹7.6 lakh/year
- VidyAI: ₹15/day → ₹5,475/year
- **Annual saving per school: ₹7.55 lakh**

### Local Setup
See `SETUP_GUIDE.md` — Node.js 18+ and Python 3.11+ required.
Full setup: approximately 20 minutes.
