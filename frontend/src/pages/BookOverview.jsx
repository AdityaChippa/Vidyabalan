import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiJson } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import ChapterCard from '../components/ChapterCard'

export default function BookOverview() {
  const { textbookId } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!textbookId) return
    Promise.all([
      apiJson(`/api/textbooks/${textbookId}`),
      apiJson(`/api/textbooks/${textbookId}/chapters`)
    ]).then(([b, c]) => {
      setBook(b); setChapters(c)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [textbookId])

  if (loading) return (
    <div className="app-layout"><Sidebar />
      <main className="app-content flex items-center justify-center">
        <p className="text-sm animate-pulse" style={{ color: 'var(--ink3)' }}>Loading...</p>
      </main>
    </div>
  )

  const totalPages = book?.total_pages || chapters.reduce((s, c) => s + (c.page_end - c.page_start + 1), 0)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="mb-8 animate-fadeUp">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl grid place-items-center text-2xl flex-shrink-0" style={{ background: 'var(--saffron-pale)' }}>📘</div>
            <div>
              <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', letterSpacing: -0.5 }}>{book?.title}</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--ink3)' }}>
                {book?.chapter_count} chapters · {totalPages} pages · {book?.total_chunks} chunks indexed
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[12px] font-medium" style={{ color: 'var(--ink3)' }}>Overall progress</span>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--paper3)' }}>
              <div className="h-full rounded-full" style={{ width: '0%', background: 'var(--green)' }} />
            </div>
            <span className="text-[12px] font-medium" style={{ color: 'var(--ink3)' }}>0%</span>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => navigate(`/ask?textbook=${textbookId}`)} className="btn-main !text-[13px] !py-2.5">Ask AI →</button>
            <button onClick={() => navigate(`/quiz?textbook=${textbookId}`)} className="btn-ghost !text-[13px] !py-2.5">Take Quiz</button>
            <button onClick={() => navigate(`/study-plan?textbook=${textbookId}`)} className="btn-ghost !text-[13px] !py-2.5">Study Plan</button>
          </div>
        </div>
        <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Chapters</h2>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {chapters.map(ch => (
            <ChapterCard key={ch.id} chapter={ch} textbookId={textbookId} />
          ))}
        </div>
      </main>
    </div>
  )
}
