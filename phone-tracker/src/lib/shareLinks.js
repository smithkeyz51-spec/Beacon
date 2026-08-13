import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// A share link lets a specific device report location WITHOUT that device
// needing to sign in. The owner generates a link from the dashboard
// (while logged in); the link embeds a random token that maps to
// { uid, deviceId }. The tracked phone opens the link and the token
// authorizes writes to that one device's pings — nothing else.
//
// Stored at: shareLinks/{token} -> { uid, deviceId, createdAt }

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
  return snap.data() // { uid, deviceId }
}
