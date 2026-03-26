import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="text-center animate-fadeUp">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
               style={{ background: 'var(--saffron)', fontFamily: 'var(--font-display)', color: 'white', fontSize: 24, fontStyle: 'italic' }}>
            V
          </div>
          <p style={{ color: 'var(--ink3)', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/" replace />

  if (adminOnly && profile?.role !== 'admin' && profile?.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
