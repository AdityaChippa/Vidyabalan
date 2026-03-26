import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { apiJson, apiFetch, supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'

export default function Profile() {
  const { profile, signOut, fetchProfile } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.full_name || '')
  const [classLevel, setClassLevel] = useState(profile?.class_level || '')
  const [language, setLanguage] = useState(profile?.language || 'en')
  const [darkMode, setDarkMode] = useState(document.documentElement.getAttribute('data-theme') === 'dark')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '')
      setClassLevel(profile.class_level || '')
      setLanguage(profile.language || 'en')
    }
  }, [profile])

  const toggleDarkMode = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('vidyai-theme', next ? 'dark' : 'light')
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      await apiJson('/api/profile/', {
        method: 'PUT',
        body: JSON.stringify({ full_name: name, class_level: classLevel, language })
      })
      await fetchProfile()
      setMsg('Profile updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally { setSaving(false) }
  }

  const handleChangePassword = async () => {
    try {
      await supabase.auth.resetPasswordForEmail(profile?.email || '')
      setMsg('Password reset email sent! Check your inbox.')
    } catch (e) {
      setMsg('Error: ' + e.message)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This cannot be undone.')
    if (!confirmed) return
    const doubleConfirm = confirm('This will permanently delete all your data, study plans, quiz history, and conversations. Continue?')
    if (!doubleConfirm) return
    try {
      await apiJson('/api/profile/', { method: 'DELETE' })
      await signOut()
      navigate('/')
    } catch (e) {
      setMsg('Error: ' + e.message)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await apiFetch('/api/profile/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      await fetchProfile()
      setMsg('Avatar updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) {
      setMsg('Error: ' + e.message)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <h1 className="text-2xl mb-1 animate-fadeUp" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Profile & Settings</h1>
        <p className="text-sm mb-8 animate-fadeUp delay-1" style={{ color: 'var(--ink3)' }}>Manage your account and preferences.</p>

        <div className="max-w-lg">
          {msg && (
            <div className="mb-4 py-2.5 px-4 rounded-xl text-[13px] font-medium animate-fadeUp"
                 style={{ background: msg.startsWith('Error') ? '#fde8e8' : 'var(--green-pale)', color: msg.startsWith('Error') ? '#e74c3c' : 'var(--green)' }}>
              {msg}
            </div>
          )}

          {/* Avatar */}
          <div className="card mb-4 animate-fadeUp delay-2" style={{ padding: 24 }}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full grid place-items-center text-2xl font-semibold overflow-hidden"
                     style={{ background: 'var(--saffron-pale)', color: 'var(--saffron)' }}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (profile?.full_name || 'U')[0].toUpperCase()
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full grid place-items-center cursor-pointer"
                       style={{ background: 'var(--ink)', color: 'white', fontSize: 11 }}>
                  📷
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div>
                <div className="text-base font-semibold" style={{ color: 'var(--ink)' }}>{profile?.full_name || 'User'}</div>
                <div className="text-[13px] capitalize" style={{ color: 'var(--ink3)' }}>{profile?.role || 'student'}</div>
              </div>
            </div>
          </div>

          {/* Edit fields */}
          <div className="card mb-4 animate-fadeUp delay-3" style={{ padding: 24 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Personal Info</h3>
            <div className="mb-3">
              <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Full Name</label>
              <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Class</label>
              <select className="input-field" value={classLevel} onChange={e => setClassLevel(e.target.value)} style={{ appearance: 'auto' }}>
                <option value="">Select</option>
                {[6,7,8,9,10,11,12].map(n => <option key={n} value={`Std ${n}`}>Std {n}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: 'var(--ink3)' }}>Preferred Language</label>
              <select className="input-field" value={language} onChange={e => setLanguage(e.target.value)} style={{ appearance: 'auto' }}>
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-main w-full justify-center">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Appearance */}
          <div className="card mb-4 animate-fadeUp delay-4" style={{ padding: 24 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Dark Mode</div>
                <div className="text-[12px]" style={{ color: 'var(--ink3)' }}>Switch between light and dark themes</div>
              </div>
              <button onClick={toggleDarkMode}
                className="relative w-11 h-6 rounded-full border-none cursor-pointer transition-all"
                style={{ background: darkMode ? 'var(--saffron)' : 'var(--paper3)' }}>
                <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                     style={{ background: 'white', left: darkMode ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
              </button>
            </div>
          </div>

          {/* Security */}
          <div className="card mb-4 animate-fadeUp delay-5" style={{ padding: 24 }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}>Security</h3>
            <button onClick={handleChangePassword} className="btn-ghost w-full justify-center mb-3">Change Password</button>
            <button onClick={handleDeleteAccount}
              className="w-full py-3 rounded-xl text-[14px] font-medium border-none cursor-pointer transition-all"
              style={{ background: '#fde8e8', color: '#e74c3c', fontFamily: 'var(--font-body)' }}>
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
