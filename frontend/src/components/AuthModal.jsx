import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66 2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function AuthModal({ isOpen, onClose, defaultTab = 'signin' }) {
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth()
  const [tab, setTab] = useState(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  // Sign In state
  const [siEmail, setSiEmail] = useState('')
  const [siPass, setSiPass] = useState('')
  const [siShowPw, setSiShowPw] = useState(false)

  // Sign Up state
  const [suName, setSuName] = useState('')
  const [suEmail, setSuEmail] = useState('')
  const [suPass, setSuPass] = useState('')
  const [suRole, setSuRole] = useState('')
  const [suShowPw, setSuShowPw] = useState(false)

  if (!isOpen) return null

  const handleSignIn = async () => {
    setError('')
    if (!siEmail.includes('@')) { setError('Enter a valid email'); return }
    if (siPass.length < 6) { setError('Password too short'); return }
    setLoading(true)
    try {
      await signIn(siEmail, siPass)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const handleSignUp = async () => {
    setError('')
    if (!suName.trim()) { setError('Enter your name'); return }
    if (!suEmail.includes('@')) { setError('Enter a valid email'); return }
    if (suPass.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await signUp(suEmail, suPass, suName, suRole || 'student')
      setSuccess({ title: 'Account created!', msg: 'Check your email to verify your account, then sign in.' })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const handleForgot = async () => {
    if (!siEmail.includes('@')) { setError('Enter your email first'); return }
    setLoading(true)
    try {
      await resetPassword(siEmail)
      setSuccess({ title: 'Reset email sent!', msg: `We sent a password reset link to ${siEmail}. Check your inbox.` })
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  const pwStrength = (pw) => {
    if (pw.length < 8) return { width: '20%', color: '#e74c3c', label: 'Too short' }
    let score = 0
    if (/[a-z]/.test(pw)) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^a-zA-Z0-9]/.test(pw)) score++
    if (score <= 1) return { width: '33%', color: '#e74c3c', label: 'Weak' }
    if (score <= 2) return { width: '66%', color: '#f39c12', label: 'Medium' }
    return { width: '100%', color: 'var(--green)', label: 'Strong' }
  }

  return (
    <div
      className="fixed inset-0 z-[500] flex items-center justify-center p-6"
      style={{ background: 'rgba(14,14,14,0.5)', backdropFilter: 'blur(10px)', opacity: 1 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[400px] rounded-3xl p-11 text-center"
           style={{ background: 'white', boxShadow: '0 24px 80px rgba(0,0,0,.2)', animation: 'fadeUp 0.3s ease' }}>
        <button onClick={onClose}
          className="absolute top-[18px] right-[18px] w-[30px] h-[30px] rounded-full border-none cursor-pointer text-[15px] grid place-items-center"
          style={{ background: 'var(--paper2)', color: 'var(--ink3)', lineHeight: 1 }}>✕</button>

        {success ? (
          <div className="py-2">
            <div className="text-[40px] mb-3.5">✅</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--ink)', marginBottom: 8 }}>{success.title}</div>
            <p style={{ fontSize: 14, color: 'var(--ink3)', lineHeight: 1.6 }}>{success.msg}</p>
          </div>
        ) : (
          <>
            <div className="w-[52px] h-[52px] rounded-[14px] mx-auto mb-[22px] grid place-items-center"
                 style={{ background: 'var(--saffron)', fontFamily: 'var(--font-display)', fontSize: 28, color: 'white', fontStyle: 'italic' }}>V</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 27, letterSpacing: '-0.5px', color: 'var(--ink)', marginBottom: 8 }}>Welcome to VidyAI</h2>
            <p style={{ fontSize: 15, color: 'var(--ink3)', lineHeight: 1.5, marginBottom: 28 }}>Your intelligent study companion for every textbook.</p>

            {/* Tabs */}
            <div className="flex rounded-[10px] p-[3px] gap-[3px] mb-[22px]" style={{ background: 'var(--paper2)' }}>
              {['signin', 'signup'].map(t => (
                <button key={t} onClick={() => { setTab(t); setError('') }}
                  className="flex-1 py-[9px] border-none rounded-lg text-sm font-medium cursor-pointer transition-all"
                  style={{
                    fontFamily: 'var(--font-body)',
                    background: tab === t ? 'white' : 'transparent',
                    color: tab === t ? 'var(--ink)' : 'var(--ink3)',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.08)' : 'none'
                  }}>
                  {t === 'signin' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            {error && <p className="text-sm mb-3 text-red-500">{error}</p>}

            {/* Sign In Panel */}
            {tab === 'signin' && (
              <div>
                <div className="relative mb-2.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none">✉️</span>
                  <input className="input-field !pl-[38px]" type="email" placeholder="Email address"
                    value={siEmail} onChange={e => setSiEmail(e.target.value)} />
                </div>
                <div className="relative mb-2.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none">🔒</span>
                  <input className="input-field !pl-[38px] !pr-[70px]"
                    type={siShowPw ? 'text' : 'password'} placeholder="Password"
                    value={siPass} onChange={e => setSiPass(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
                  <button onClick={() => setSiShowPw(!siShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[13px]"
                    style={{ color: 'var(--ink3)', fontFamily: 'var(--font-body)' }}>{siShowPw ? 'Hide' : 'Show'}</button>
                </div>
                <button onClick={handleForgot}
                  className="w-full text-right text-[13px] mb-3.5 bg-transparent border-none cursor-pointer"
                  style={{ color: 'var(--saffron)', fontFamily: 'var(--font-body)' }}>Forgot password?</button>
                <button onClick={handleSignIn} disabled={loading}
                  className="w-full py-3.5 border-none rounded-xl text-[15px] font-medium cursor-pointer transition-all"
                  style={{ background: 'var(--ink)', color: 'white', fontFamily: 'var(--font-body)' }}>
                  {loading ? 'Signing in...' : 'Sign In →'}
                </button>
                <div className="flex items-center gap-2.5 my-3.5 text-[13px]" style={{ color: 'var(--ink3)' }}>
                  <span className="flex-1 h-px" style={{ background: 'var(--border)' }} />or<span className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <button onClick={handleGoogle} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-[13px] px-[22px] rounded-xl text-[15px] font-medium cursor-pointer transition-all"
                  style={{ background: 'white', border: '1.5px solid var(--border)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                  <GoogleIcon /> Continue with Google
                </button>
                <p className="mt-4 text-[13px] text-center" style={{ color: 'var(--ink3)' }}>
                  Don't have an account?{' '}
                  <a onClick={() => { setTab('signup'); setError('') }} className="cursor-pointer font-medium" style={{ color: 'var(--saffron)' }}>Sign up free</a>
                </p>
              </div>
            )}

            {/* Sign Up Panel */}
            {tab === 'signup' && (
              <div>
                <div className="relative mb-2.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none">👤</span>
                  <input className="input-field !pl-[38px]" type="text" placeholder="Full name"
                    value={suName} onChange={e => setSuName(e.target.value)} />
                </div>
                <div className="relative mb-2.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none">✉️</span>
                  <input className="input-field !pl-[38px]" type="email" placeholder="Email address"
                    value={suEmail} onChange={e => setSuEmail(e.target.value)} />
                </div>
                <div className="relative mb-2.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] pointer-events-none">🔒</span>
                  <input className="input-field !pl-[38px] !pr-[70px]"
                    type={suShowPw ? 'text' : 'password'} placeholder="Create password (min 8 chars)"
                    value={suPass} onChange={e => setSuPass(e.target.value)} />
                  <button onClick={() => setSuShowPw(!suShowPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[13px]"
                    style={{ color: 'var(--ink3)', fontFamily: 'var(--font-body)' }}>{suShowPw ? 'Hide' : 'Show'}</button>
                </div>
                {suPass && (
                  <div className="mb-2.5">
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--paper3)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: pwStrength(suPass).width, background: pwStrength(suPass).color }} />
                    </div>
                    <p className="text-[11px] mt-1" style={{ color: pwStrength(suPass).color }}>{pwStrength(suPass).label}</p>
                  </div>
                )}
                <div className="mb-3.5">
                  <select className="input-field cursor-pointer" value={suRole} onChange={e => setSuRole(e.target.value)}
                    style={{ appearance: 'auto' }}>
                    <option value="">I am a... (select role)</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher / Admin</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <button onClick={handleSignUp} disabled={loading}
                  className="w-full py-3.5 border-none rounded-xl text-[15px] font-medium cursor-pointer transition-all mb-2.5"
                  style={{ background: 'var(--ink)', color: 'white', fontFamily: 'var(--font-body)' }}>
                  {loading ? 'Creating account...' : 'Create Account →'}
                </button>
                <div className="flex items-center gap-2.5 my-3.5 text-[13px]" style={{ color: 'var(--ink3)' }}>
                  <span className="flex-1 h-px" style={{ background: 'var(--border)' }} />or<span className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                </div>
                <button onClick={handleGoogle} disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-[13px] px-[22px] rounded-xl text-[15px] font-medium cursor-pointer transition-all"
                  style={{ background: 'white', border: '1.5px solid var(--border)', color: 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                  <GoogleIcon /> Sign up with Google
                </button>
                <p className="mt-4 text-[13px] text-center" style={{ color: 'var(--ink3)' }}>
                  Already have an account?{' '}
                  <a onClick={() => { setTab('signin'); setError('') }} className="cursor-pointer font-medium" style={{ color: 'var(--saffron)' }}>Sign in</a>
                </p>
              </div>
            )}

            <p className="mt-3.5 text-[12px] leading-relaxed text-center" style={{ color: 'var(--ink3)' }}>
              By continuing you agree to our Terms of Service. Your data is stored securely and never shared.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
