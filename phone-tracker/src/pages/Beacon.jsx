import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { resolveShareLink } from '../lib/shareLinks.js'
import { recordPing } from '../lib/devices.js'

export default function Beacon() {
  const { token } = useParams()
  const [status, setStatus] = useState('resolving')
  const [pingCount, setPingCount] = useState(0)
  const [lastPingAt, setLastPingAt] = useState(null)
  const linkRef = useRef(null)
  const watchIdRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function start() {
      const link = await resolveShareLink(token)
      if (cancelled) return
      if (!link) {
        setStatus('invalid')
        return
      }
      linkRef.current = link

      if (!('geolocation' in navigator)) {
        setStatus('error')
        return
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          if (cancelled) return
          setStatus('active')
          setPingCount((c) => c + 1)
          setLastPingAt(new Date())
          try {
            await recordPing(linkRef.current.uid, linkRef.current.deviceId, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            })
          } catch (err) {
            console.error('Failed to record ping', err)
          }
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setStatus('denied')
          else setStatus('error')
        },
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
      )
    }

    start()

    return () => {
      cancelled = true
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [token])

  return (
    <div className="beacon-page">
      <div className="pulse-ring"><div className="pulse-dot" /></div>

      {status === 'resolving' && (
        <>
          <h1>Connecting…</h1>
          <p>Setting up this device to report its location.</p>
        </>
      )}

      {status === 'active' && (
        <>
          <h1>Reporting location</h1>
          <p>Keep this page open (or leave it added to your home screen) to keep sharing this device's location. Closing it stops the updates.</p>
          <div className="ping-log">
            {pingCount} update{pingCount === 1 ? '' : 's'} sent
            {lastPingAt && ` · last at ${lastPingAt.toLocaleTimeString()}`}
          </div>
        </>
      )}

      {status === 'denied' && (
        <>
          <h1>Location access needed</h1>
          <p>This page can't report location because permission was denied. Open your browser's site settings and allow location for this page, then reload.</p>
        </>
      )}

      {status === 'invalid' && (
        <>
          <h1>Link not found</h1>
          <p>This tracking link is invalid or has expired. Ask the device owner to generate a new one from their dashboard.</p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1>Location unavailable</h1>
          <p>This browser can't provide location right now. Try again in a moment.</p>
        </>
      )}
    </div>
  )
}
