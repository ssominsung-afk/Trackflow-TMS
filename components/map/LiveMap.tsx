'use client'

import { useMemo, useCallback } from 'react'
import { GoogleMap, useJsApiLoader, Marker, Polyline, Circle } from '@react-google-maps/api'
import { GOOGLE_MAPS_LIBRARIES, defaultMapOptions } from '@/lib/google-maps'
import type { Load, LocationPing, Geofence } from '@/types'

interface Props {
  loads?: Load[]
  pings?: LocationPing[]
  geofences?: Geofence[]
  center?: { lat: number; lng: number }
  zoom?: number
}

const mapContainerStyle = { width: '100%', height: '100%' }

export default function LiveMap({
  loads = [],
  pings = [],
  geofences = [],
  center = { lat: 39.8283, lng: -98.5795 }, // US center
  zoom = 4,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  // Polyline paths from pings
  const pingPaths = useMemo(() => {
    return pings.map(p => ({ lat: p.lat, lng: p.lng }))
  }, [pings])

  const onLoad = useCallback((map: google.maps.Map) => {
    // If we have pings or loads with location, auto-bound
    const bounds = new window.google.maps.LatLngBounds()
    let hasBounds = false

    pings.forEach(p => { bounds.extend({ lat: p.lat, lng: p.lng }); hasBounds = true })
    loads.forEach(l => {
      if (l.pickup_lat && l.pickup_lng) { bounds.extend({ lat: l.pickup_lat, lng: l.pickup_lng }); hasBounds = true }
      if (l.delivery_lat && l.delivery_lng) { bounds.extend({ lat: l.delivery_lat, lng: l.delivery_lng }); hasBounds = true }
    })

    if (hasBounds) {
      map.fitBounds(bounds)
      // Zoom out a bit if it's too close
      setTimeout(() => { if (map.getZoom()! > 14) map.setZoom(14) }, 100)
    }
  }, [loads, pings])

  if (!isLoaded) return <div style={{ width: '100%', height: '100%', background: 'var(--bg-hover)' }} />

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center}
      zoom={zoom}
      options={defaultMapOptions}
      onLoad={onLoad}
    >
      {/* Route lines */}
      {pingPaths.length > 0 && (
        <Polyline
          path={pingPaths}
          options={{ strokeColor: '#3b82f6', strokeOpacity: 0.8, strokeWeight: 4 }}
        />
      )}

      {/* Geofences */}
      {geofences.map(gf => (
        <Circle
          key={gf.id}
          center={{ lat: gf.lat, lng: gf.lng }}
          radius={gf.radius_m}
          options={{
            fillColor: gf.type === 'pickup' ? '#3b82f6' : '#10b981',
            fillOpacity: 0.1,
            strokeColor: gf.type === 'pickup' ? '#3b82f6' : '#10b981',
            strokeOpacity: 0.5,
            strokeWeight: 1,
          }}
        />
      ))}

      {/* Load markers (pickup/delivery) */}
      {loads.map(l => (
        <div key={l.id}>
          {l.pickup_lat && l.pickup_lng && (
            <Marker position={{ lat: l.pickup_lat, lng: l.pickup_lng }} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }} />
          )}
          {l.delivery_lat && l.delivery_lng && (
            <Marker position={{ lat: l.delivery_lat, lng: l.delivery_lng }} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 6, fillColor: '#10b981', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 }} />
          )}
        </div>
      ))}

      {/* Live driver marker (latest ping) */}
      {pings.length > 0 && (
        <Marker
          position={{ lat: pings[pings.length - 1].lat, lng: pings[pings.length - 1].lng }}
          icon={{
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 5,
            fillColor: '#f59e0b',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
            rotation: pings[pings.length - 1].heading ?? 0,
          }}
        />
      )}
    </GoogleMap>
  )
}
