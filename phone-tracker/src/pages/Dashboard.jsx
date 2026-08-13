import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../lib/AuthContext.jsx'
import { subscribeToDevices, createDevice } from '../lib/devices.js'
import { createShareLink } from '../lib/shareLinks.js'
import LiveMap from '../components/LiveMap.jsx'

const STALE_AFTER_MS = 10 * 60 * 1000 // 10 minutes

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [devices, setDevices] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [shareUrl, setShareUrl] = useState(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToDevices(user.uid, (list) => {
      setDevices(list)
      setSelectedId((current) => current ?? list[0]?.id ?? null)
    })
    return unsub
  }, [user])

  const selected = useMemo(
    () => devices.find((d) => d.id === selectedId) || null,
    [devices, selectedId]
  )

  async function handleCreateDevice(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const id = await createDevice(user.uid, newName.trim())
    setNewName('')
    setCreating(false)
    setSelectedId(id)
  }

  async function handleGetLink(deviceId) {
    const token = await createShareLink(user.uid, deviceId)
    const url = `${window.location.origin}/b/${token}`
    setShareUrl(url)
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          Beacon
        </div>
        <div className="topbar-actions">
          <span>{user?.email}</span>
          <button className="btn btn-ghost" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="main">
        <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="device-grid">
            <div className="device-list">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', margin: 0 }}>Devices</h2>
                <button className="btn" onClick={() => setCreating((v) => !v)}>
                  {creating ? 'Cancel' : '+ Add device'}
                </button>
              </div>

              {creating && (
                <form onSubmit={handleCreateDevice} className="panel" style={{ marginBottom: 'var(--space-3)' }}>
                  <div className="field" style={{ marginBottom: 'var(--space-3)' }}>
                    <label htmlFor="deviceName">Device name</label>
                    <input
                      id="deviceName"
                      placeholder="e.g. Sam's iPhone"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
                    Create device
                  </button>
                </form>
              )}

              {devices.length === 0 && !creating && (
                <div className="panel empty-state">
                  <h3>No devices yet</h3>
                  <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>
                    Add a device, then generate a link to open on that phone.
                  </p>
                  <button className="btn btn-primary" onClick={() => setCreating(true)}>
                    + Add device
                  </button>
                </div>
              )}

              {devices.map((d) => (
                <DeviceCard
                  key={d.id}
                  device={d}
                  active={d.id === selectedId}
                  onSelect={() => setSelectedId(d.id)}
                  onGetLink={() => handleGetLink(d.id)}
                />
              ))}

              {shareUrl && (
                <div className="panel" style={{ marginTop: 'var(--space-2)' }}>
                  <p style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--ink-300)' }}>
                    Open this link on the phone you want to track. It only needs to be opened once — keep the page or PWA open to keep reporting location.
                  </p>
                  <div className="link-out">
                    <span style={{ flex: 1 }}>{shareUrl}</span>
                    <button
                      className="btn btn-ghost"
                      onClick={() => navigator.clipboard.writeText(shareUrl)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="map-panel">
              <LiveMap location={selected?.lastLocation} />
              <div className="coord-strip">
                {selected?.lastLocation ? (
                  <>
                    <span>LAT <strong>{selected.lastLocation.lat.toFixed(5)}</strong></span>
                    <span>LNG <strong>{selected.lastLocation.lng.toFixed(5)}</strong></span>
                    <span>ACC <strong>±{Math.round(selected.lastLocation.accuracy || 0)}m</strong></span>
                    <span style={{ marginLeft: 'auto' }}>
                      <LastSeen ts={selected.lastSeen} />
                    </span>
                  </>
                ) : (
                  <span>{selected ? 'No location reported yet.' : 'Select a device.'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function DeviceCard({ device, active, onSelect, onGetLink }) {
  const isLive = isRecentTimestamp(device.lastSeen)
  return (
    <div className={`device-card${active ? ' active' : ''}`} onClick={onSelect}>
      <div className="device-card-top">
        <span className="device-name">{device.name}</span>
        <span className={`status-dot ${isLive ? 'live' : 'stale'}`} title={isLive ? 'Live' : 'Stale'} />
      </div>
      <div className="device-meta">
        <LastSeen ts={device.lastSeen} prefix="Last seen " />
      </div>
      <div style={{ marginTop: 'var(--space-3)' }}>
        <button
          className="btn"
          style={{ fontSize: 'var(--text-xs)', padding: '6px 10px' }}
          onClick={(e) => {
            e.stopPropagation()
            onGetLink()
          }}
        >
          Get tracking link
        </button>
      </div>
    </div>
  )
}

function isRecentTimestamp(ts) {
  if (!ts?.toMillis) return false
  return Date.now() - ts.toMillis() < STALE_AFTER_MS
}

function LastSeen({ ts, prefix = '' }) {
  if (!ts?.toMillis) return <span>{prefix}never</span>
  const diffMs = Date.now() - ts.toMillis()
  const mins = Math.floor(diffMs / 60000)
  let text
  if (mins < 1) text = 'just now'
  else if (mins < 60) text = `${mins}m ago`
  else if (mins < 1440) text = `${Math.floor(mins / 60)}h ago`
  else text = `${Math.floor(mins / 1440)}d ago`
  return <span>{prefix}{text}</span>
}
