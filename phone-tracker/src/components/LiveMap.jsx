import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'
import { useEffect } from 'react'
import L from 'leaflet'

const beaconIcon = new L.DivIcon({
  className: 'beacon-marker',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#22D48A;border:2px solid #0B0F14;box-shadow:0 0 0 4px rgba(34,212,138,0.25);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
})

function Recenter({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) {
      map.setView([lat, lng], map.getZoom() < 13 ? 15 : map.getZoom())
    }
  }, [lat, lng]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function LiveMap({ location }) {
  const hasLocation = location && location.lat != null && location.lng != null
  const center = hasLocation ? [location.lat, location.lng] : [20, 0]
  const zoom = hasLocation ? 15 : 2

  return (
    <MapContainer center={center} zoom={zoom} className="map-container" scrollWheelZoom zoomControl>
      <TileLayer
       url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

      />
      {hasLocation && (
        <>
          <Marker position={[location.lat, location.lng]} icon={beaconIcon} />
          {location.accuracy && (
            <Circle
              center={[location.lat, location.lng]}
              radius={location.accuracy}
              pathOptions={{ color: '#22D48A', fillColor: '#22D48A', fillOpacity: 0.08, weight: 1 }}
            />
          )}
          <Recenter lat={location.lat} lng={location.lng} />
        </>
      )}
    </MapContainer>
  )
}
