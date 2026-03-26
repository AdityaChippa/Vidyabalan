export default function TokenBar({ tokensUsed, tokensBaseline, costActual, costBaseline, pruningEnabled }) {
  const savings = (costBaseline - costActual).toFixed(3)
  const pct = tokensBaseline > 0 ? Math.max(1, Math.round((tokensUsed / tokensBaseline) * 100)) : 100

  return (
    <div className="rounded-[10px] p-3.5 text-xs animate-fadeUp"
         style={{ background: 'var(--paper)', border: '1px solid var(--border)' }}>
      <div className="flex justify-between mb-2" style={{ color: 'var(--ink3)' }}>
        <span>Context sent to AI</span>
        <span className="font-semibold" style={{ color: 'var(--green)' }}>Saved ₹{savings} on this query</span>
      </div>

      <div className="text-[11px] mb-1" style={{ color: 'var(--ink3)' }}>
        With pruning (VidyAI)
      </div>
      <div className="h-[5px] rounded-[3px] overflow-hidden mb-[3px]" style={{ background: 'var(--paper3)' }}>
        <div className="h-full rounded-[3px] transition-all duration-1000" style={{ width: `${pct}%`, background: 'var(--saffron)' }} />
      </div>
      <div className="flex justify-between text-[11px]" style={{ color: 'var(--ink3)' }}>
        <span>{tokensUsed.toLocaleString()} tokens</span>
        <span>{pruningEnabled ? 'Relevant chunks only' : 'All chunks'}</span>
      </div>

      <div className="text-[11px] mt-2 mb-1" style={{ color: 'var(--ink3)' }}>
        Without pruning (baseline)
      </div>
      <div className="h-[5px] rounded-[3px] overflow-hidden mb-[3px]" style={{ background: 'var(--paper3)' }}>
        <div className="h-full rounded-[3px]" style={{ width: '100%', background: '#ccc' }} />
      </div>
      <div className="flex justify-between text-[11px]" style={{ color: 'var(--ink3)' }}>
        <span>{tokensBaseline.toLocaleString()} tokens</span>
        <span>Entire textbook</span>
      </div>
    </div>
  )
}
