export default function PruningToggle({ enabled, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-medium" style={{ color: 'var(--ink2)' }}>Context Pruning</span>
      <button onClick={() => onChange(!enabled)}
        className="relative w-11 h-6 rounded-full border-none cursor-pointer transition-all"
        style={{ background: enabled ? 'var(--green)' : 'var(--paper3)' }}>
        <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
             style={{ background: 'white', left: enabled ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
      </button>
      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
            style={{
              background: enabled ? 'var(--green-pale)' : '#fde8e8',
              color: enabled ? 'var(--green)' : '#e74c3c'
            }}>
        {enabled ? '● ON' : '● OFF'}
      </span>
    </div>
  )
}
