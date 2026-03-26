import { useState, useEffect } from 'react'
import { apiJson } from '../supabaseClient'

const STEPS = [
  { num: 1, title: 'File uploaded securely', icon: '☁️' },
  { num: 2, title: 'PDF type detected', icon: '🔍' },
  { num: 3, title: 'OCR text extraction', icon: '📝' },
  { num: 4, title: 'Chapter structure detected', icon: '📑' },
  { num: 5, title: 'Smart chunking + embeddings', icon: '🧩' },
  { num: 6, title: 'Quiz bank generating', icon: '🎯' },
  { num: 7, title: 'Study plan building', icon: '📋' },
]

export default function UploadProgress({ jobId, onComplete }) {
  const [job, setJob] = useState(null)

  useEffect(() => {
    if (!jobId) return
    const interval = setInterval(async () => {
      try {
        const data = await apiJson(`/api/textbooks/job/${jobId}`)
        setJob(data)
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(interval)
          if (data.status === 'completed' && onComplete) {
            setTimeout(() => onComplete(data.textbook_id), 1500)
          }
        }
      } catch (e) {
        console.error('Poll error:', e)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [jobId])

  const currentStep = job?.current_step_number || 0
  const progress = job?.progress || 0
  const stepsCompleted = job?.steps_completed || []

  const getStepDetail = (num) => {
    const s = stepsCompleted.find(s => s.step === num)
    return s?.detail || ''
  }

  const getStepStatus = (num) => {
    if (job?.status === 'error' && currentStep === num) return 'error'
    if (num < currentStep) return 'done'
    if (num === currentStep) return 'active'
    return 'waiting'
  }

  const estimatedMinutes = Math.max(1, Math.ceil((100 - progress) / 12))

  return (
    <div className="max-w-lg mx-auto animate-fadeUp">
      <div className="card" style={{ padding: 32 }}>
        <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>
          Processing your textbook
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--ink3)' }}>
          This takes 2–5 minutes depending on the PDF size.
        </p>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden mb-6" style={{ background: 'var(--paper3)' }}>
          <div className="h-full rounded-full transition-all duration-700"
               style={{ width: `${progress}%`, background: job?.status === 'error' ? '#e74c3c' : 'var(--saffron)' }} />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-4">
          {STEPS.map(step => {
            const status = getStepStatus(step.num)
            const detail = getStepDetail(step.num)
            return (
              <div key={step.num} className="flex items-start gap-3" style={{ opacity: status === 'waiting' ? 0.4 : 1, transition: 'opacity 0.3s' }}>
                <div className="w-8 h-8 rounded-full grid place-items-center flex-shrink-0 text-sm"
                     style={{
                       background: status === 'done' ? 'var(--green-pale)' : status === 'active' ? 'var(--saffron-pale)' : status === 'error' ? '#fde8e8' : 'var(--paper2)',
                       color: status === 'done' ? 'var(--green)' : status === 'active' ? 'var(--saffron)' : status === 'error' ? '#e74c3c' : 'var(--ink3)',
                     }}>
                  {status === 'done' ? '✓' : status === 'active' ? <span className="animate-spin">⟳</span> : status === 'error' ? '✕' : step.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium" style={{ color: status === 'done' ? 'var(--green)' : status === 'error' ? '#e74c3c' : 'var(--ink)' }}>
                    {step.title}
                  </div>
                  {detail && (
                    <div className="text-[12px] mt-0.5" style={{ color: 'var(--ink3)' }}>{detail}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 text-center text-[13px]" style={{ borderTop: '1px solid var(--border)', color: 'var(--ink3)' }}>
          {job?.status === 'completed' ? (
            <span style={{ color: 'var(--green)', fontWeight: 600 }}>✅ Processing complete!</span>
          ) : job?.status === 'error' ? (
            <span style={{ color: '#e74c3c', fontWeight: 500 }}>❌ Error: {job?.error_message || 'Processing failed'}</span>
          ) : (
            <>~{estimatedMinutes} min remaining · <strong>You can close this tab — processing continues</strong></>
          )}
        </div>
      </div>
    </div>
  )
}
