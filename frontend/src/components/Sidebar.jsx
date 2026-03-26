import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

const navItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/upload', icon: '📄', label: 'Upload' },
  { path: '/ask', icon: '🧠', label: 'Ask AI' },
  { path: '/quiz', icon: '🎯', label: 'Quiz' },
  { path: '/study-plan', icon: '📋', label: 'Study Plan' },
  { path: '/progress', icon: '📊', label: 'Progress' },
  { path: '/evaluate', label: 'Evaluate', icon: '📝' }
]

const adminItems = [
  { path: '/analytics', icon: '📈', label: 'Analytics' },
  { path: '/admin', icon: '⚙️', label: 'Admin Panel' },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = profile?.role === 'admin' || profile?.role === 'teacher'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const linkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px', borderRadius: 10,
    fontSize: 14, fontWeight: 500, textDecoration: 'none',
    color: isActive ? 'var(--saffron)' : 'var(--ink2)',
    background: isActive ? 'var(--saffron-pale)' : 'transparent',
    transition: 'all 0.15s',
  })

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] rounded-[10px] grid place-items-center"
             style={{ background: 'var(--saffron)', fontFamily: 'var(--font-display)', fontSize: 18, color: 'white', fontStyle: 'italic' }}>V</div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: 'var(--ink)', letterSpacing: '-0.3px' }}>
          Vidya<span style={{ color: 'var(--saffron)' }}>AI</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
            style={({ isActive }) => linkStyle(isActive)}>
            <span className="text-lg">{item.icon}</span>{item.label}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <div className="mt-4 mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink3)' }}>Admin</div>
            {adminItems.map(item => (
              <NavLink key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                style={({ isActive }) => linkStyle(isActive)}>
                <span className="text-lg">{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Profile */}
      <div className="px-3 pb-4">
        <NavLink to="/profile" onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 p-3 rounded-xl transition-all"
          style={{ background: 'var(--paper2)', textDecoration: 'none' }}>
          <div className="w-9 h-9 rounded-full grid place-items-center text-sm font-semibold"
               style={{ background: 'var(--saffron-pale)', color: 'var(--saffron)' }}>
            {(profile?.full_name || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{profile?.full_name || 'User'}</div>
            <div className="text-[11px] capitalize" style={{ color: 'var(--ink3)' }}>{profile?.role || 'student'}</div>
          </div>
        </NavLink>
        <button onClick={handleSignOut}
          className="w-full mt-2 py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-all"
          style={{ background: 'transparent', color: 'var(--ink3)', fontFamily: 'var(--font-body)' }}>
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] z-40"
             style={{ background: 'var(--paper)', borderRight: '1px solid var(--border)' }}>
        <SidebarContent />
      </aside>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-2 px-1"
           style={{ background: 'var(--paper)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        {navItems.slice(0, 5).map(item => (
          <NavLink key={item.path} to={item.path}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px]"
            style={({ isActive }) => ({ color: isActive ? 'var(--saffron)' : 'var(--ink3)', textDecoration: 'none' })}>
            <span className="text-xl">{item.icon}</span>{item.label}
          </NavLink>
        ))}
        <NavLink to="/profile"
          className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[10px]"
          style={({ isActive }) => ({ color: isActive ? 'var(--saffron)' : 'var(--ink3)', textDecoration: 'none' })}>
          <span className="text-xl">👤</span>More
        </NavLink>
      </div>
    </>
  )
}
