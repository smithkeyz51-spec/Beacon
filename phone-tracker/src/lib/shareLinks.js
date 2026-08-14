import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

function randomToken(length = 24) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let out = ''
  const arr = new Uint32Array(length)
  crypto.getRandomValues(arr)
  for (let i = 0; i < length; i++) out += chars[arr[i] % chars.length]
  return out
}

export async function createShareLink(uid, deviceId) {
  const token = randomToken()
  await setDoc(doc(db, 'shareLinks', token), {
    uid,
    deviceId,
    createdAt: serverTimestamp()
  })
  return token
}

export async function resolveShareLink(token) {
  const snap = await getDoc(doc(db, 'shareLinks', token))
  if (!snap.exists()) return null
  return snap.data()
}
