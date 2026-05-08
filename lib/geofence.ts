import type { Geofence, GeofenceCheckResult } from '@/types'

const EARTH_RADIUS_M = 6371000

export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return EARTH_RADIUS_M * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function checkGeofences(
  lat: number,
  lng: number,
  geofences: Geofence[]
): GeofenceCheckResult[] {
  const results: GeofenceCheckResult[] = []

  for (const gf of geofences) {
    if (gf.triggered) continue
    const distance = haversineDistance(lat, lng, gf.lat, gf.lng)
    if (distance <= gf.radius_m) {
      results.push({ entered: true, type: gf.type, geofence: gf })
    }
  }

  return results
}
