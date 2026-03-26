import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import UploadProgress from '../components/UploadProgress'

export default function Upload() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [classLevel, setClassLevel] = useState('')
  const [board, setBoard] = useState('')
  const [uploading, setUploading] = useState(false)
  const [jobId, setJobId] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') {
      setFile(f); if (!title) setTitle(f.name.replace('.pdf', ''))
    }
  }

  const handleSelect = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); if (!title) setTitle(f.name.replace('.pdf', '')) }
  }

  const handleUpload = async () => {
    if (!file || !title) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('title', title)
    fd.append('subject', subject)
    fd.append('class_level', classLevel)
    fd.append('board', board)
    try {
      const res = await apiFetch('/api/textbooks/upload', { method: 'POST', body: fd })
      const data = await res.json()
      setJobId(data.job_id)
    } catch (e) {
      alert('Upload failed: ' + e.message)
      setUploading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl mb-1 animate-fadeUp" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Upload Textbook</h1>
          <p className="text-sm mb-8 animate-fadeUp delay-1" style={{ color: 'var(--ink3)' }}>
            Upload any PDF — text or scanned. We'll extract chapters, generate quizzes, and build your study plan.
          </p>

          {jobId ? (
            <UploadProgress jobId={jobId} onComplete={(tbId) => navigate(`/book/${tbId}`)} />
          ) : (
            <div className="animate-fadeUp delay-2">
              {/* Drop Zone */}
              <div className={`rounded-2xl p-12 text-center cursor-pointer transition-all mb-6 ${dragOver ? 'scale-[1.02]' : ''}`}
                   style={{
                     border: `2px dashed ${dragOver ? 'var(--saffron)' : 'var(--border)'}`,
                     background: dragOver ? 'var(--saffron-pale)' : 'var(--paper2)',
                   }}
                   onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                   onDragLeave={() => setDragOver(false)}
                   onDrop={handleDrop}
                   onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleSelect} />
                <div className="text-4xl mb-3">{file ? '📄' : '📂'}</div>
                {file ? (
                  <>
                    <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{file.name}</div>
                    <div className="text-[12px] mt-1" style={{ color: 'var(--ink3)' }}>{(file.size / 1024 / 1024).toFixed(1)} MB · PDF</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium" style={{ color: 'var(--ink2)' }}>Drop your PDF here or click to browse</div>
                    <div className="text-[12px] mt-1" style={{ color: 'var(--ink3)' }}>Supports text and scanned PDFs · Max 50MB</div>
                  </>
                )}
              </div>

              {/* Metadata */}
              <div className="card" style={{ padding: 24 }}>
                <div className="mb-4">
                  <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Title *</label>
                  <input className="input-field" placeholder="e.g. Maharashtra Science Std 8" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div>
                    <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Subject</label>
                    <input className="input-field" placeholder="Science" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Class</label>
                    <select className="input-field" value={classLevel} onChange={e => setClassLevel(e.target.value)} style={{ appearance: 'auto' }}>
                      <option value="">Select</option>
                      {[6,7,8,9,10,11,12].map(n => <option key={n} value={`Std ${n}`}>Std {n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Board</label>
                    <select className="input-field" value={board} onChange={e => setBoard(e.target.value)} style={{ appearance: 'auto' }}>
                      <option value="">Select</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <button onClick={handleUpload} disabled={!file || !title || uploading}
                  className="btn-main w-full justify-center" style={{ padding: '14px 24px' }}>
                  {uploading ? 'Uploading...' : 'Upload & Process →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
