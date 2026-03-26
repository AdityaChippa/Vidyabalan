import { useNavigate } from 'react-router-dom'

export default function ChapterCard({ chapter, textbookId, completion = 0 }) {
  const navigate = useNavigate()
  const topics = chapter.topic_summary || []
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (completion / 100) * circumference

  return (
    <div className="rounded-2xl p-5 transition-all hover:shadow-lg cursor-pointer"
         style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}
         onClick={() => navigate(`/learn?textbook=${textbookId}&chapter=${chapter.id}`)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: 'var(--saffron-pale)', color: 'var(--saffron)' }}>
          Chapter {chapter.chapter_number}
        </span>
        <svg width="44" height="44" className="transform -rotate-90">
          <circle cx="22" cy="22" r={radius} fill="none" stroke="var(--paper3)" strokeWidth="3" />
          <circle cx="22" cy="22" r={radius} fill="none" stroke="var(--green)" strokeWidth="3"
                  strokeDasharray={circumference} strokeDashoffset={offset}
                  strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s' }} />
        </svg>
      </div>
      <h4 className="text-[15px] font-semibold mb-1.5 leading-snug" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
        {chapter.title}
      </h4>
      <p className="text-[12px] mb-3" style={{ color: 'var(--ink3)' }}>
        Pages {chapter.page_start}–{chapter.page_end} · {chapter.estimated_minutes || 15} min read
      </p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {topics.slice(0, 3).map((t, i) => (
          <span key={i} className="text-[11px] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--paper2)', color: 'var(--ink3)' }}>{t}</span>
        ))}
      </div>
      <button className="w-full py-2 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-all"
              style={{ background: 'var(--ink)', color: 'var(--paper)', fontFamily: 'var(--font-body)' }}>
        Start →
      </button>
    </div>
  )
}
