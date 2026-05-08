import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number; speed: number | null; heading: number | null; accuracy: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!isActive) return

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          speed: position.coords.speed,       // m/s
          heading: position.coords.heading,
          accuracy: position.coords.accuracy,
        })
        setError(null)
      },
      (err) => {
        setError(err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )

    return () => navigator.geolocation.clearWatch(watchId)
  }, [isActive])

  return { location, error, isActive, setIsActive }
}
