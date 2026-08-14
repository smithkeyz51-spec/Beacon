import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// If any required config value is missing, initializeApp() throws — and
// with no error boundary that produces exactly a blank screen with no
// visible message. Fail loudly instead so it's obvious what's wrong.
const missingKeys = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k)

if (missingKeys.length > 0) {
  const message = `Missing Firebase config: ${missingKeys.join(', ')}. Check your environment variables (Vercel project settings, or local .env file), then redeploy/restart.`
  document.body.innerHTML = `<div style="font-family:monospace;background:#0B0F14;color:#FF6B57;padding:24px;min-height:100vh;white-space:pre-wrap;">${message}</div>`
  throw new Error(message)
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
