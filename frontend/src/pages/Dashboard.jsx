import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTextbook } from '../hooks/useTextbook'
import { apiJson } from '../supabaseClient'
import Sidebar from '../components/Sidebar'

export default function Dashboard() {
  const { profile } = useAuth()
  const { textbooks, loading } = useTextbook()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)

  useEffect(() => {
    apiJson('/api/analytics/user-progress').then(setProgress).catch(() => {})
  }, [])

  const completedBooks = textbooks.filter(t => t.processing_status === 'completed')

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        {/* Header */}
        <div className="mb-8 animate-fadeUp">
          <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)', letterSpacing: -0.5 }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink3)' }}>Here's your study overview.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '🔥', value: progress?.streak_days || 0, label: 'Day Streak', color: 'var(--saffron)' },
            { icon: '❓', value: progress?.total_questions_asked || 0, label: 'Questions Asked', color: 'var(--green)' },
            { icon: '📚', value: completedBooks.length, label: 'Books', color: '#4f6ef5' },
            { icon: '🎯', value: `${progress?.avg_quiz_score || 0}%`, label: 'Avg Quiz Score', color: '#b8860b' },
          ].map((s, i) => (
            <div key={i} className="card animate-fadeUp" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
              <div className="text-[12px]" style={{ color: 'var(--ink3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          <button onClick={() => navigate('/upload')} className="card text-left hover:shadow-lg transition-all cursor-pointer border-none"
                  style={{ background: 'var(--saffron-pale)' }}>
            <div className="text-2xl mb-2">📄</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--saffron)' }}>Upload Textbook</div>
            <div className="text-[12px]" style={{ color: 'var(--ink3)' }}>Add a new PDF to study</div>
          </button>
          <button onClick={() => navigate('/ask')} className="card text-left hover:shadow-lg transition-all cursor-pointer border-none"
                  style={{ background: 'var(--green-pale)' }}>
            <div className="text-2xl mb-2">🧠</div>
            <div className="text-sm font-semibold" style={{ color: 'var(--green)' }}>Ask AI</div>
            <div className="text-[12px]" style={{ color: 'var(--ink3)' }}>Chat with your textbook</div>
          </button>
          <button onClick={() => navigate('/quiz')} className="card text-left hover:shadow-lg transition-all cursor-pointer border-none"
                  style={{ background: '#eef2ff' }}>
            <div className="text-2xl mb-2">🎯</div>
            <div className="text-sm font-semibold" style={{ color: '#4f6ef5' }}>Take Quiz</div>
            <div className="text-[12px]" style={{ color: 'var(--ink3)' }}>Test your knowledge</div>
          </button>
        </div>

        {/* Textbooks */}
        <div>
          <h2 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Your Textbooks</h2>
          {loading ? (
            <div className="text-sm animate-pulse" style={{ color: 'var(--ink3)' }}>Loading...</div>
          ) : completedBooks.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📚</div>
              <div className="text-sm font-medium mb-2" style={{ color: 'var(--ink2)' }}>No textbooks yet</div>
              <p className="text-[13px] mb-4" style={{ color: 'var(--ink3)' }}>Upload your first textbook to get started.</p>
              <button onClick={() => navigate('/upload')} className="btn-main">Upload PDF →</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {completedBooks.map(book => (
                <div key={book.id} className="card cursor-pointer hover:shadow-lg transition-all"
                     onClick={() => navigate(`/book/${book.id}`)}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl grid place-items-center text-xl flex-shrink-0" style={{ background: 'var(--saffron-pale)' }}>📘</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{book.title}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink3)' }}>
                        {book.chapter_count} chapters · {book.total_chunks} chunks
                      </div>
                      <div className="flex gap-2 mt-2">
                        {book.subject && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--paper2)', color: 'var(--ink3)' }}>{book.subject}</span>}
                        {book.class_level && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--paper2)', color: 'var(--ink3)' }}>{book.class_level}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
