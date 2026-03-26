export default function StudyPlanDay({ entry, onToggle }) {
  const typeColors = {
    study: { bg: 'var(--saffron-pale)', color: 'var(--saffron)', dot: 'var(--saffron)' },
    revision: { bg: 'var(--green-pale)', color: 'var(--green)', dot: 'var(--green)' },
    exam: { bg: '#fde8e8', color: '#e74c3c', dot: '#e74c3c' },
  }
  const tc = typeColors[entry.type] || typeColors.study

  return (
    <div className="flex items-start gap-3 py-3 px-4 rounded-xl transition-all"
         style={{ background: entry.completed ? 'var(--green-pale)' : 'var(--paper)', border: '1px solid var(--border)' }}>
      {entry.type !== 'exam' && (
        <button onClick={() => onToggle && onToggle(entry.day, !entry.completed)}
          className="w-5 h-5 rounded-md border-2 grid place-items-center mt-0.5 flex-shrink-0 cursor-pointer"
          style={{
            borderColor: entry.completed ? 'var(--green)' : 'var(--border)',
            background: entry.completed ? 'var(--green)' : 'transparent',
            color: 'white', fontSize: 11,
          }}>
          {entry.completed && '✓'}
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: tc.bg, color: tc.color }}>
            Day {entry.day} · {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--ink3)' }}>{entry.date}</span>
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--ink)', textDecoration: entry.completed ? 'line-through' : 'none' }}>
          {entry.title}
        </div>
        <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink3)' }}>{entry.description}</div>
        {entry.hours > 0 && (
          <div className="text-[11px] mt-1" style={{ color: 'var(--ink3)' }}>⏱ {entry.hours}h study time</div>
        )}
      </div>
    </div>
  )
}
