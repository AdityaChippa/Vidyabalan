import { useEffect, useRef } from 'react'

export default function QuizScoreChart({ attempts = [] }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    if (!canvasRef.current || !attempts.length) return
    const ctx = canvasRef.current.getContext('2d')
    const w = canvasRef.current.width = canvasRef.current.offsetWidth * 2
    const h = canvasRef.current.height = canvasRef.current.offsetHeight * 2
    ctx.scale(2, 2)
    const cw = w / 2, ch = h / 2
    const pad = { top: 20, right: 20, bottom: 30, left: 35 }
    const plotW = cw - pad.left - pad.right, plotH = ch - pad.top - pad.bottom
    ctx.clearRect(0, 0, cw, ch)
    const sorted = [...attempts].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    const scores = sorted.map(a => Math.round((a.score / Math.max(1, a.total)) * 100))
    ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 0.5
    for (let i = 0; i <= 10; i++) { const y = pad.top + (plotH * (1 - i / 10)); ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(cw - pad.right, y); ctx.stroke() }
    ctx.fillStyle = '#999'; ctx.font = '10px "DM Sans"'; ctx.textAlign = 'right'
    for (let i = 0; i <= 10; i++) { ctx.fillText(i * 10, pad.left - 5, pad.top + (plotH * (1 - i / 10)) + 3) }
    if (scores.length >= 1) {
      const gap = scores.length > 1 ? plotW / (scores.length - 1) : plotW / 2
      ctx.beginPath()
      scores.forEach((s, i) => { const x = pad.left + i * gap, y = pad.top + plotH * (1 - s / 100); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) })
      ctx.lineTo(pad.left + (scores.length - 1) * gap, pad.top + plotH); ctx.lineTo(pad.left, pad.top + plotH); ctx.closePath()
      ctx.fillStyle = 'rgba(26,107,60,0.08)'; ctx.fill()
      ctx.beginPath()
      scores.forEach((s, i) => { const x = pad.left + i * gap, y = pad.top + plotH * (1 - s / 100); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) })
      ctx.strokeStyle = '#1a6b3c'; ctx.lineWidth = 2; ctx.stroke()
      scores.forEach((s, i) => { const x = pad.left + i * gap, y = pad.top + plotH * (1 - s / 100); ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = '#1a6b3c'; ctx.fill(); ctx.strokeStyle = 'white'; ctx.lineWidth = 2; ctx.stroke() })
      ctx.fillStyle = '#999'; ctx.font = '10px "DM Sans"'; ctx.textAlign = 'center'
      scores.forEach((_, i) => { ctx.fillText(`Quiz ${i + 1}`, pad.left + i * gap, ch - 5) })
    }
  }, [attempts])
  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Quiz Score History</h3>
      <div style={{ height: 200, position: 'relative' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        {!attempts.length && <div className="absolute inset-0 flex items-center justify-center text-[13px]" style={{ color: 'var(--ink3)' }}>No quiz attempts yet</div>}
      </div>
    </div>
  )
}
