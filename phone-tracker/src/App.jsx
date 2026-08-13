import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Beacon from './pages/Beacon.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* /b/:token — the page a tracked phone opens. No login required. */}
      <Route path="/b/:token" element={<Beacon />} />

      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
