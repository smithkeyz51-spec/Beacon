import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// Devices are stored at: users/{uid}/devices/{deviceId}
// Each device doc holds the latest known location plus a `pings` subcollection
// for history (kept short — we cap reads with `limit`).

export function devicesCollection(uid) {
  return collection(db, 'users', uid, 'devices')
}

export async function createDevice(uid, name) {
  const ref = await addDoc(devicesCollection(uid), {
    name: name || 'Unnamed device',
    createdAt: serverTimestamp(),
    lastSeen: null,
    lastLocation: null
  })
  return ref.id
}

export function subscribeToDevices(uid, callback) {
  const q = query(devicesCollection(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    const devices = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(devices)
  })
}

export async function recordPing(uid, deviceId, { lat, lng, accuracy }) {
  const deviceRef = doc(db, 'users', uid, 'devices', deviceId)
  await setDoc(
    deviceRef,
    {
      lastSeen: serverTimestamp(),
      lastLocation: { lat, lng, accuracy }
    },
    { merge: true }
  )

  const pingsRef = collection(db, 'users', uid, 'devices', deviceId, 'pings')
  await addDoc(pingsRef, {
    lat,
    lng,
    accuracy,
    at: serverTimestamp()
  })
}

export function subscribeToHistory(uid, deviceId, callback, max = 50) {
  const pingsRef = collection(db, 'users', uid, 'devices', deviceId, 'pings')
  const q = query(pingsRef, orderBy('at', 'desc'), limit(max))
  return onSnapshot(q, (snap) => {
    const pings = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(pings)
  })
}
