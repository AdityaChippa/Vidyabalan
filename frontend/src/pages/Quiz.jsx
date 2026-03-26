import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTextbook } from '../hooks/useTextbook'
import { apiJson } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import QuizCard from '../components/QuizCard'

export default function Quiz() {
  const [searchParams] = useSearchParams()
  const { textbooks } = useTextbook()
  const completedBooks = textbooks.filter(t => t.processing_status === 'completed')

  const [selectedBook, setSelectedBook] = useState(searchParams.get('textbook') || '')
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState('')
  const [pageStart, setPageStart] = useState('')
  const [pageEnd, setPageEnd] = useState('')
  const [questionType, setQuestionType] = useState('mixed')
  const [difficulty, setDifficulty] = useState('medium')
  const [language, setLanguage] = useState('en')

  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!selectedBook) return
    apiJson(`/api/textbooks/${selectedBook}/chapters`).then(setChapters).catch(() => setChapters([]))
  }, [selectedBook])

  const generateQuiz = async () => {
    setLoading(true); setQuestions([]); setAnswers({}); setShowResults(false); setCurrentQ(0)
    try {
      const body = { textbook_id: selectedBook, question_type: questionType, difficulty, language, count: 10 }
      if (selectedChapter) body.chapter_id = selectedChapter
      if (pageStart && pageEnd) { body.page_start = parseInt(pageStart); body.page_end = parseInt(pageEnd) }
      const data = await apiJson('/api/quiz/generate', { method: 'POST', body: JSON.stringify(body) })
      setQuestions(data.questions || [])
    } catch (e) { alert('Quiz generation failed: ' + e.message) }
    finally { setLoading(false) }
  }

  const submitQuiz = async () => {
    let s = 0
    questions.forEach((q, i) => {
      if (q.question_type === 'mcq' && answers[i] === q.correct_answer) s++
      else if (q.question_type === 'short_answer' && answers[i]?.toLowerCase().includes(q.correct_answer?.toLowerCase().substring(0, 20))) s++
    })
    setScore(s); setShowResults(true)
    try {
      await apiJson('/api/quiz/submit', { method: 'POST', body: JSON.stringify({
        textbook_id: selectedBook, chapter_id: selectedChapter || null,
        questions: questions.map(q => q.question), answers: Object.values(answers),
        score: s, total: questions.length, time_taken_seconds: Math.floor((Date.now() - startTime) / 1000)
      })})
    } catch {}
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <h1 className="text-2xl mb-1 animate-fadeUp" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Quiz Engine</h1>
        <p className="text-sm mb-6 animate-fadeUp delay-1" style={{ color: 'var(--ink3)' }}>Generate and take quizzes from your textbook.</p>

        {questions.length === 0 ? (
          <div className="max-w-lg mx-auto card animate-fadeUp delay-2" style={{ padding: 28 }}>
            <div className="mb-4">
              <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Textbook</label>
              <select className="input-field" value={selectedBook} onChange={e => setSelectedBook(e.target.value)} style={{ appearance: 'auto' }}>
                <option value="">Select textbook...</option>
                {completedBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            </div>
            {chapters.length > 0 && (
              <div className="mb-4">
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Chapter (or use page range below)</label>
                <select className="input-field" value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="">All chapters</option>
                  {chapters.map(c => <option key={c.id} value={c.id}>Ch {c.chapter_number}: {c.title}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Page start</label>
                <input className="input-field" type="number" placeholder="e.g. 40" value={pageStart} onChange={e => setPageStart(e.target.value)} />
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Page end</label>
                <input className="input-field" type="number" placeholder="e.g. 60" value={pageEnd} onChange={e => setPageEnd(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Type</label>
                <select className="input-field" value={questionType} onChange={e => setQuestionType(e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="mixed">Mixed</option><option value="mcq">MCQ</option><option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Difficulty</label>
                <select className="input-field" value={difficulty} onChange={e => setDifficulty(e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Language</label>
                <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)} style={{ appearance: 'auto' }}>
                  <option value="en">English</option><option value="hi">Hindi</option><option value="mr">Marathi</option><option value="ta">Tamil</option>
                </select>
              </div>
            </div>
            <button onClick={generateQuiz} disabled={!selectedBook || loading} className="btn-main w-full justify-center">
              {loading ? 'Generating...' : 'Generate Quiz →'}
            </button>
          </div>
        ) : showResults ? (
          <div className="max-w-lg mx-auto animate-fadeUp">
            <div className="card text-center mb-6" style={{ padding: 32 }}>
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Quiz Complete!</h2>
              {/* Score ring */}
              <svg width="120" height="120" className="mx-auto mb-4">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--paper3)" strokeWidth="8" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--green)" strokeWidth="8"
                  strokeDasharray={314} strokeDashoffset={314 - (score / questions.length) * 314}
                  strokeLinecap="round" transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 1s' }} />
                <text x="60" y="55" textAnchor="middle" style={{ fontFamily: 'var(--font-display)', fontSize: 28, fill: 'var(--ink)' }}>
                  {score}
                </text>
                <text x="60" y="75" textAnchor="middle" style={{ fontSize: 13, fill: 'var(--ink3)' }}>of {questions.length}</text>
              </svg>
              <p className="text-sm" style={{ color: 'var(--ink3)' }}>{Math.round(score / questions.length * 100)}% correct</p>
            </div>
            {/* Review */}
            <div className="flex flex-col gap-4 mb-6">
              {questions.map((q, i) => (
                <QuizCard key={i} question={q} index={i} total={questions.length}
                  selectedAnswer={answers[i]} onSelect={() => {}} showResult={true}
                  isCorrect={q.question_type === 'mcq' ? answers[i] === q.correct_answer : true} />
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setQuestions([]); setAnswers({}); setShowResults(false) }} className="btn-ghost">New Quiz</button>
              <button onClick={() => {
                const wrong = questions.map((q, i) => answers[i] !== q.correct_answer ? i : null).filter(i => i !== null)
                if (wrong.length) { setCurrentQ(wrong[0]); setShowResults(false) }
              }} className="btn-main">Retry Wrong Answers</button>
            </div>
          </div>
        ) : (
          <div className="animate-fadeUp">
            {/* Progress */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>Question {currentQ + 1} of {questions.length}</span>
              <div className="flex-1 mx-4 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--paper3)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${((currentQ + 1) / questions.length) * 100}%`, background: 'var(--saffron)' }} />
              </div>
            </div>
            <QuizCard question={questions[currentQ]} index={currentQ} total={questions.length}
              selectedAnswer={answers[currentQ]} onSelect={val => setAnswers(prev => ({ ...prev, [currentQ]: val }))} showResult={false} />
            <div className="flex justify-between mt-6 max-w-[640px] mx-auto">
              <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="btn-ghost">← Back</button>
              {currentQ < questions.length - 1 ? (
                <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-main" disabled={!answers[currentQ]}>Next →</button>
              ) : (
                <button onClick={submitQuiz} className="btn-main" style={{ background: 'var(--green)' }}>Submit Quiz ✓</button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
