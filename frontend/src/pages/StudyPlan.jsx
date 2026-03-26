import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiJson, supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function StudyPlan() {
  const [params] = useSearchParams()
  const textbookId = params.get('textbook')
  const [textbooks, setTextbooks] = useState([])
  const [selectedBook, setSelectedBook] = useState(textbookId || '')
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [view, setView] = useState('list')
  // User inputs for plan generation
  const [examDate, setExamDate] = useState('')
  const [dailyHours, setDailyHours] = useState(2)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => { apiJson('/api/textbooks/').then(t => { setTextbooks(t); if (!selectedBook && t.length) setSelectedBook(t[0].id) }).catch(() => {}) }, [])
  
  useEffect(() => {
    if (!selectedBook) return
    setLoading(true)
    apiJson(`/api/study-plan/${selectedBook}`)
      .then(d => { if (d?.plan && d.plan.length > 0) setPlan(d); else setShowSetup(true) })
      .catch(() => setShowSetup(true))
      .finally(() => setLoading(false))
  }, [selectedBook])

  const generatePlan = async () => {
    if (!selectedBook) return
    setGenerating(true)
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token
      const res = await fetch(`${API}/api/study-plan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ textbook_id: selectedBook, exam_date: examDate || null, daily_hours: dailyHours })
      })
      const data = await res.json()
      if (data?.plan) { setPlan(data); setShowSetup(false) }
      else {
        // Reload
        const d = await apiJson(`/api/study-plan/${selectedBook}`)
        if (d?.plan) { setPlan(d); setShowSetup(false) }
      }
    } catch (e) { console.error('Plan gen error:', e) }
    setGenerating(false)
  }

  const days = plan?.plan || []
  const tc = { study: { bg: 'var(--saffron-pale)', color: 'var(--saffron)', icon: '📖' }, revision: { bg: 'var(--green-pale)', color: 'var(--green)', icon: '🔄' }, quiz: { bg: '#eef2ff', color: '#4f6ef5', icon: '🎯' } }
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="app-layout"><Sidebar />
      <main className="app-content">
        <div className="animate-fadeUp">
          <h1 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Study Plan</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>Your personalized day-by-day study schedule.</p>
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select value={selectedBook} onChange={e => { setSelectedBook(e.target.value); setPlan(null); setShowSetup(true) }}
            className="px-4 py-2.5 rounded-xl text-sm border-none" style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)', minWidth: 200 }}>
            {textbooks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          {days.length > 0 && (
            <>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {['list','calendar'].map(v => (
                  <button key={v} onClick={() => setView(v)} className="px-4 py-2 text-[12px] font-medium cursor-pointer border-none"
                    style={{ background: view===v?'var(--ink)':'var(--paper)', color: view===v?'var(--paper)':'var(--ink3)', fontFamily:'var(--font-body)' }}>
                    {v==='list'?'📋 List':'📅 Calendar'}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowSetup(true)} className="btn-ghost !text-[12px] !py-2 ml-auto">⚙ Regenerate Plan</button>
            </>
          )}
        </div>

        {/* Setup form - shown before generating or on regenerate */}
        {(showSetup || days.length === 0) && !loading && (
          <div className="card mb-6 animate-fadeUp" style={{ padding: 24, maxWidth: 500 }}>
            <h3 className="text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              {days.length > 0 ? 'Regenerate Study Plan' : 'Create Your Study Plan'}
            </h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--ink2)' }}>Exam Date (optional)</label>
                <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm border-none"
                  style={{ background: 'var(--paper2)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}
                  min={new Date().toISOString().split('T')[0]} />
                <p className="text-[11px] mt-1" style={{ color: 'var(--ink3)' }}>Leave empty for a default 30-day plan</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--ink2)' }}>Daily Study Hours</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="1" max="6" step="0.5" value={dailyHours}
                    onChange={e => setDailyHours(parseFloat(e.target.value))}
                    className="flex-1" style={{ accentColor: 'var(--saffron)' }} />
                  <span className="text-lg font-bold w-12 text-center" style={{ fontFamily: 'var(--font-display)', color: 'var(--saffron)' }}>
                    {dailyHours}h
                  </span>
                </div>
              </div>
              <button onClick={generatePlan} disabled={generating} className="btn-main !py-3 mt-2"
                style={{ opacity: generating ? 0.6 : 1 }}>
                {generating ? '⟳ Generating...' : 'Generate Study Plan →'}
              </button>
              {days.length > 0 && (
                <button onClick={() => setShowSetup(false)} className="btn-ghost !text-[13px]">Cancel</button>
              )}
            </div>
          </div>
        )}

        {loading ? <div className="text-center py-16"><div className="animate-spin text-2xl mb-3">⟳</div></div>
        : days.length > 0 && !showSetup ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 mb-4 flex-wrap">
              {[{l:'Study',t:'study',c:'var(--saffron)'},{l:'Revision',t:'revision',c:'var(--green)'},{l:'Quiz',t:'quiz',c:'#4f6ef5'},{l:'Total',t:null,c:'var(--ink)'}].map(s => (
                <div key={s.l} className="card flex-1" style={{ padding: 16, minWidth: 130 }}>
                  <div className="text-2xl font-bold" style={{ fontFamily:'var(--font-display)', color: s.c }}>{s.t ? days.filter(d => d.type===s.t).length : days.length}</div>
                  <div className="text-[12px]" style={{ color: 'var(--ink3)' }}>{s.l} days</div>
                </div>
              ))}
            </div>

            {view === 'list' ? days.map((day, i) => {
              const t = tc[day.type] || tc.study; const isToday = day.date === todayStr
              return (
                <div key={i} className="card transition-all hover:shadow-md" style={{ padding: 16, borderLeft: isToday?'4px solid var(--saffron)':'none' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl grid place-items-center text-lg flex-shrink-0" style={{ background: t.bg }}>{t.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full" style={{ background: t.bg, color: t.color }}>Day {day.day} · {day.type}</span>
                        {isToday && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background:'var(--saffron)',color:'white' }}>TODAY</span>}
                        <span className="text-[11px] ml-auto" style={{ color:'var(--ink3)' }}>{day.date ? new Date(day.date).toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric'}) : ''}</span>
                      </div>
                      <h4 className="text-sm font-semibold mb-1.5" style={{ fontFamily:'var(--font-display)',color:'var(--ink)' }}>{day.title}</h4>
                      {(day.goals||[]).map((g,gi) => <div key={gi} className="flex items-start gap-2 text-[12px]" style={{ color:'var(--ink3)' }}><span>○</span><span>{g}</span></div>)}
                      {day.hours && <div className="text-[11px] mt-2" style={{ color:'var(--ink3)' }}>⏱ {day.hours}h</div>}
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <div key={d} className="text-center text-[11px] font-semibold py-2" style={{ color:'var(--ink3)' }}>{d}</div>)}
                {days.map((day,i) => { const t = tc[day.type]||tc.study; return (
                  <div key={i} className="rounded-lg p-2 text-center" style={{ background: day.date===todayStr?'var(--saffron-pale)':'var(--paper)', border:'1px solid var(--border)' }}>
                    <div className="text-lg mb-0.5">{t.icon}</div>
                    <div className="text-[11px] font-semibold" style={{ color:'var(--ink)' }}>Day {day.day}</div>
                    <div className="text-[10px]" style={{ color: t.color }}>{day.type}</div>
                  </div>
                )})}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}
