import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Login() {
  const { login, signup } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await signup(email, password)
      }
      navigate('/')
    } catch (err) {
      setError(readableError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card panel">
        <h1>Beacon</h1>
        <p className="sub">
          {mode === 'login' ? 'Sign in to see your devices.' : 'Create an account to start tracking a device.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <>No account yet? <button onClick={() => setMode('signup')}>Create one</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('login')}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}

function readableError(err) {
  const code = err?.code || ''
  if (code.includes('invalid-credential') || code.includes('wrong-password')) return 'Incorrect email or password.'
  if (code.includes('user-not-found')) return 'No account with that email.'
  if (code.includes('email-already-in-use')) return 'An account with that email already exists.'
  if (code.includes('weak-password')) return 'Password should be at least 6 characters.'
  if (code.includes('invalid-email')) return 'That email address looks invalid.'
  return 'Something went wrong. Please try again.'
}
