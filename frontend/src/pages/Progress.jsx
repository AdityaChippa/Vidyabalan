import { useState, useEffect } from 'react'
import { apiJson } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import QuizScoreChart from '../components/charts/QuizScoreChart'
import StudyTimeChart from '../components/charts/StudyTimeChart'

export default function Progress() {
  const [stats, setStats] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiJson('/api/analytics/user-progress'),
      apiJson('/api/analytics/quiz-attempts').catch(() => []),
    ]).then(([s, a]) => {
      setStats(s)
      setAttempts(Array.isArray(a) ? a : [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="app-layout"><Sidebar /><main className="app-content flex items-center justify-center">
      <p className="text-sm animate-pulse" style={{ color: 'var(--ink3)' }}>Loading...</p>
    </main></div>
  )

  const questionsAsked = stats?.questions_asked || 0
  const avgScore = stats?.avg_quiz_score || 0
  const quizzesTaken = stats?.quizzes_taken || 0
  const streak = stats?.streak || 1
  const userName = stats?.name || 'Student'

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="animate-fadeUp">
          <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Your Progress</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>Track your study journey.</p>
        </div>

        {/* Streak */}
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'linear-gradient(135deg, var(--green-pale), rgba(255,255,255,0.5))' }}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--saffron)' }}>
                {streak} day streak!
              </div>
              <div className="text-sm" style={{ color: 'var(--ink3)' }}>Keep it up, {userName}!</div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { icon: '❓', value: questionsAsked, label: 'Questions Asked' },
            { icon: '🎯', value: `${avgScore}%`, label: 'Avg Quiz Score' },
            { icon: '📝', value: quizzesTaken, label: 'Quizzes Taken' },
            { icon: '⏱', value: '—', label: 'Total Study Time' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 16 }}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{s.value}</div>
              <div className="text-[12px]" style={{ color: 'var(--ink3)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <QuizScoreChart attempts={attempts} />
          <StudyTimeChart />
        </div>
      </main>
    </div>
  )
}
