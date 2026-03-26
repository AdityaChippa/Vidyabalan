import { useState, useEffect, useRef } from 'react'
import { apiJson } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import CostSavingsChart from '../components/charts/CostSavingsChart'
import { QueriesPerHourChart, LanguageDonutChart } from '../components/charts/QueriesChart'

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [dailyCosts, setDailyCosts] = useState([])
  const [queriesHour, setQueriesHour] = useState([])
  const [langDist, setLangDist] = useState([])
  const [recentQueries, setRecentQueries] = useState([])
  const [simPruning, setSimPruning] = useState(true)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef(null)

  const fetchAll = async () => {
    try {
      const [s, dc, qh, ld, rq] = await Promise.all([
        apiJson('/api/analytics/summary'),
        apiJson('/api/analytics/daily-costs'),
        apiJson('/api/analytics/queries-per-hour'),
        apiJson('/api/analytics/language-distribution'),
        apiJson('/api/analytics/recent-queries'),
      ])
      setSummary(s); setDailyCosts(dc); setQueriesHour(qh); setLangDist(ld); setRecentQueries(rq)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
    intervalRef.current = setInterval(fetchAll, 10000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const simMultiplier = simPruning ? 1 : 140
  const savedToday = (summary?.total_cost_saved_inr || 0) * (simPruning ? 1 : 0)
  const displaySaved = simPruning ? (summary?.total_cost_saved_inr || 0).toFixed(2) : '0.00'

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4 animate-fadeUp">
          <div>
            <h1 className="text-2xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Analytics Dashboard</h1>
            <p className="text-sm" style={{ color: 'var(--ink3)' }}>Real-time cost savings from Context Pruning.</p>
          </div>
          {/* Pruning simulation toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--paper2)', border: '1px solid var(--border)' }}>
            <span className="text-[13px] font-medium" style={{ color: 'var(--ink2)' }}>Pruning Simulation</span>
            <button onClick={() => setSimPruning(!simPruning)}
              className="relative w-11 h-6 rounded-full border-none cursor-pointer transition-all"
              style={{ background: simPruning ? 'var(--green)' : '#e74c3c' }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                   style={{ background: 'white', left: simPruning ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
            </button>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: simPruning ? 'var(--green-pale)' : '#fde8e8', color: simPruning ? 'var(--green)' : '#e74c3c' }}>
              {simPruning ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>

        {/* Giant savings number */}
        <div className="card mb-6 text-center animate-fadeUp delay-1" style={{
          padding: '40px 24px',
          background: simPruning ? 'linear-gradient(135deg,var(--green-pale),var(--saffron-pale))' : 'linear-gradient(135deg,#fde8e8,#fff3e8)',
          transition: 'background 0.5s'
        }}>
          <div className="text-[clamp(36px,6vw,64px)] font-semibold transition-all"
               style={{ fontFamily: 'var(--font-display)', color: simPruning ? 'var(--green)' : '#e74c3c' }}>
            ₹{simPruning ? (summary?.total_cost_saved_inr || 0).toFixed(2) : ((summary?.total_cost_saved_inr || 0) * -140).toFixed(2)} {simPruning ? 'saved today' : 'OVERSPENT today'}
          </div>
          <p className="text-sm mt-2" style={{ color: 'var(--ink3)' }}>
            Across {summary?.total_queries_today || 0} queries · {(summary?.total_tokens_saved || 0).toLocaleString()} tokens eliminated
          </p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: '🔍', value: summary?.total_queries_today || 0, label: 'Queries Today', color: 'var(--saffron)' },
            { icon: '🧩', value: (summary?.total_tokens_saved || 0).toLocaleString(), label: 'Tokens Saved', color: 'var(--green)' },
            { icon: '₹', value: `₹${((summary?.avg_cost_per_query_inr || 0) * simMultiplier).toFixed(4)}`, label: 'Avg Cost/Query', color: '#4f6ef5' },
            { icon: '⚡', value: `${summary?.avg_response_time_ms || 0}ms`, label: 'Avg Response', color: '#b8860b' },
          ].map((m, i) => (
            <div key={i} className="card animate-fadeUp" style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
              <div className="text-xl mb-1">{m.icon}</div>
              <div className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)', color: m.color }}>{m.value}</div>
              <div className="text-[11px]" style={{ color: 'var(--ink3)' }}>{m.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card animate-fadeUp delay-3" style={{ padding: 24 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Daily Cost: Baseline vs VidyAI (7 days)
            </h3>
            <CostSavingsChart data={dailyCosts} />
          </div>
          <div className="card animate-fadeUp delay-4" style={{ padding: 24 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
              Queries per Hour (Today)
            </h3>
            <QueriesPerHourChart data={queriesHour} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card animate-fadeUp delay-5" style={{ padding: 24 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Language Distribution</h3>
            <LanguageDonutChart data={langDist.length ? langDist : [{ language: 'English', count: 1 }]} />
          </div>
          <div className="card md:col-span-2 animate-fadeUp" style={{ padding: 24, animationDelay: '0.6s' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>School Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { v: summary?.total_students || 0, l: 'Total Students' },
                { v: summary?.active_today || 0, l: 'Active Today' },
                { v: summary?.total_books || 0, l: 'Textbooks' },
                { v: summary?.total_queries_today || 0, l: 'Queries Today' },
              ].map((s, i) => (
                <div key={i} className="text-center py-4 rounded-xl" style={{ background: 'var(--paper2)' }}>
                  <div className="text-xl font-semibold" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>{s.v}</div>
                  <div className="text-[11px]" style={{ color: 'var(--ink3)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent queries table */}
        <div className="card animate-fadeUp" style={{ padding: 24, animationDelay: '0.7s' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Recent Queries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Time', 'Question', 'Tokens Used', 'Saved', 'Cost', 'Response', 'Pruning'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentQueries || []).slice(0, 10).map((q, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border2)' }}>
                    <td className="py-2 px-3 text-[12px]" style={{ color: 'var(--ink3)' }}>{new Date(q.created_at).toLocaleTimeString()}</td>
                    <td className="py-2 px-3 text-[12px] max-w-[200px] truncate" style={{ color: 'var(--ink)' }}>{q.question_preview}</td>
                    <td className="py-2 px-3 text-[12px]" style={{ color: 'var(--ink2)' }}>{q.tokens_used?.toLocaleString()}</td>
                    <td className="py-2 px-3 text-[12px] font-medium" style={{ color: 'var(--green)' }}>{(q.tokens_baseline - q.tokens_used)?.toLocaleString()}</td>
                    <td className="py-2 px-3 text-[12px]" style={{ color: 'var(--ink2)' }}>₹{parseFloat(q.cost_actual || 0).toFixed(4)}</td>
                    <td className="py-2 px-3 text-[12px]" style={{ color: 'var(--ink2)' }}>{q.response_time_ms}ms</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: q.pruning_enabled ? 'var(--green-pale)' : '#fde8e8', color: q.pruning_enabled ? 'var(--green)' : '#e74c3c' }}>
                        {q.pruning_enabled ? 'ON' : 'OFF'}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!recentQueries || recentQueries.length === 0) && (
                  <tr><td colSpan="7" className="py-8 text-center text-[13px]" style={{ color: 'var(--ink3)' }}>No queries yet. Start asking questions to see data here.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
