import { useState, useEffect } from 'react'
import { apiJson } from '../supabaseClient'

export default function ProcessingWidget() {
  const [activeJobs, setActiveJobs] = useState([])
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const books = await apiJson('/api/textbooks/')
        const processing = books.filter(b => b.processing_status === 'processing')
        if (processing.length > 0) {
          const jobs = []
          for (const book of processing) {
            try {
              const jobsData = await apiJson(`/api/textbooks/job-by-textbook/${book.id}`)
              if (jobsData) jobs.push({ ...jobsData, book_title: book.title })
            } catch {}
          }
          setActiveJobs(jobs)
        } else { setActiveJobs([]) }
      } catch {}
    }
    check()
    const interval = setInterval(check, 3000)
    return () => clearInterval(interval)
  }, [])

  if (activeJobs.length === 0) return null
  const job = activeJobs[0]

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fadeUp" style={{ maxWidth: expanded ? 350 : 280 }}>
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="animate-spin text-lg">⟳</div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold truncate" style={{ color: 'var(--ink)' }}>{job.book_title || 'Processing...'}</div>
            <div className="text-[11px]" style={{ color: 'var(--ink3)' }}>{job.current_step || 'Working...'} · {job.progress || 0}%</div>
          </div>
          <span className="text-[11px]" style={{ color: 'var(--ink3)' }}>{expanded ? '▾' : '▸'}</span>
        </div>
        <div className="h-1" style={{ background: 'var(--paper3)' }}>
          <div className="h-full transition-all duration-500" style={{ width: `${job.progress || 0}%`, background: 'var(--saffron)' }} />
        </div>
        {expanded && (
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border2)' }}>
            {(job.steps_completed || []).map((step, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5 text-[11px]">
                <span style={{ color: step.done ? 'var(--green)' : 'var(--ink3)' }}>{step.done ? '✓' : '○'}</span>
                <span style={{ color: step.done ? 'var(--ink2)' : 'var(--ink3)' }}>{step.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
