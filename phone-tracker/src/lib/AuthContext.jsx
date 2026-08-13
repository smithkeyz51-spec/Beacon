import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth'
import { auth } from './firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = signed out

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  const value = {
    user,
    loading: user === undefined,
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth)
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
