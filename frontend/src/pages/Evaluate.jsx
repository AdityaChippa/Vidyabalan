import { useState, useEffect } from 'react'
import { apiJson, supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'

export default function Evaluate() {
  const [textbooks, setTextbooks] = useState([])
  const [selectedBook, setSelectedBook] = useState('')
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { apiJson('/api/textbooks/').then(setTextbooks).catch(() => {}) }, [])
  useEffect(() => { if (selectedBook) apiJson(`/api/textbooks/${selectedBook}/chapters`).then(setChapters).catch(() => {}) }, [selectedBook])

  const evaluate = async () => {
    if (!question.trim() || !answer.trim()) return
    setLoading(true); setResult(null)
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${API}/api/content/evaluate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question, student_answer: answer, textbook_id: selectedBook, chapter_id: selectedChapter })
      })
      setResult(await res.json())
    } catch { setResult({ score: 0, feedback: 'Evaluation failed.', better_answer: '', key_points_missed: [] }) }
    setLoading(false)
  }

  const scoreColor = (s) => s >= 8 ? 'var(--green)' : s >= 5 ? 'var(--saffron)' : '#e74c3c'

  return (
    <div className="app-layout"><Sidebar />
      <main className="app-content">
        <div className="animate-fadeUp">
          <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Answer Evaluator</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>Write your answer and get AI feedback with scoring.</p>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr', maxWidth: 900 }}>
          <div className="flex flex-col gap-4">
            <div className="card" style={{ padding: 16 }}>
              <div className="text-[12px] font-semibold uppercase mb-2" style={{ color: 'var(--ink3)' }}>Context (optional)</div>
              <select value={selectedBook} onChange={e => setSelectedBook(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm mb-2 border-none" style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                <option value="">Select textbook...</option>
                {textbooks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              {chapters.length > 0 && <select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm border-none" style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                <option value="">Select chapter...</option>
                {chapters.map(c => <option key={c.id} value={c.id}>Ch {c.chapter_number}: {c.title}</option>)}
              </select>}
            </div>
            <div><label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--ink2)' }}>Question</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)} placeholder="Enter question..." className="w-full px-4 py-3 rounded-xl text-sm resize-none border-none" rows={3} style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }} /></div>
            <div><label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--ink2)' }}>Your Answer</label>
              <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Write your answer..." className="w-full px-4 py-3 rounded-xl text-sm resize-none border-none" rows={6} style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }} /></div>
            <button onClick={evaluate} disabled={loading || !question.trim() || !answer.trim()} className="btn-main !py-3" style={{ opacity: loading ? 0.6 : 1 }}>
              {loading ? '⟳ Evaluating...' : 'Evaluate →'}
            </button>
          </div>
          <div>
            {result ? (
              <div className="card animate-fadeUp" style={{ padding: 24 }}>
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: scoreColor(result.score) }}>{result.score}/10</div>
                  <div className="text-sm" style={{ color: 'var(--ink3)' }}>{result.score >= 8 ? 'Excellent!' : result.score >= 5 ? 'Good effort!' : 'Keep practicing!'}</div>
                </div>
                <div className="mb-5"><div className="text-[12px] font-semibold uppercase mb-2" style={{ color: 'var(--ink3)' }}>Feedback</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{result.feedback}</p></div>
                {result.better_answer && <div className="mb-5 p-3 rounded-xl" style={{ background: 'var(--green-pale)' }}>
                  <div className="text-[12px] font-semibold uppercase mb-2" style={{ color: 'var(--green)' }}>Model Answer</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{result.better_answer}</p></div>}
                {result.key_points_missed?.length > 0 && <div className="p-3 rounded-xl" style={{ background: 'var(--saffron-pale)' }}>
                  <div className="text-[12px] font-semibold uppercase mb-2" style={{ color: 'var(--saffron)' }}>Points Missed</div>
                  {result.key_points_missed.map((p, i) => <div key={i} className="text-sm mb-1" style={{ color: 'var(--ink2)' }}>• {p}</div>)}</div>}
              </div>
            ) : (
              <div className="card flex items-center justify-center" style={{ padding: 24, minHeight: 300 }}>
                <div className="text-center"><div className="text-4xl mb-3">📝</div><p className="text-sm" style={{ color: 'var(--ink3)' }}>Enter a question and answer to get feedback.</p></div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
