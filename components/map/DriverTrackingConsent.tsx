'use client'

import { useState, useEffect, useRef } from 'react'
import { Radio, MapPin, Truck, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { useGeolocation } from '@/hooks/useGeolocation'
import toast from 'react-hot-toast'

interface Props {
  token: string
  loadData: {
    load_number: string
    pickup_city: string
    pickup_state: string
    delivery_city: string
    delivery_state: string
    commodity: string
  }
}

export default function DriverTrackingConsent({ token, loadData }: Props) {
  const { location, error, isActive, setIsActive } = useGeolocation()
  const [loading, setLoading] = useState(false)
  const lastPingRef = useRef<number>(0)

  // Auto-ping location every 2 minutes when active
  useEffect(() => {
    if (!isActive || !location) return

    const now = Date.now()
    if (now - lastPingRef.current < 120_000) return // 2 min throttle

    async function sendPing() {
      try {
        await fetch('/api/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            lat: location!.lat,
            lng: location!.lng,
            speed_mph: location!.speed ? location!.speed * 2.23694 : null,
            heading: location!.heading,
            accuracy_m: location!.accuracy,
          }),
        })
        lastPingRef.current = Date.now()
      } catch (err) {
        console.error('Failed to send location ping', err)
      }
    }

    sendPing()
  }, [location, isActive, token])

  async function handleAccept() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tracking/${token}/consent`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to record consent')
      setIsActive(true)
      toast.success('Tracking started. Drive safe!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleStop() {
    setLoading(true)
    try {
      const res = await fetch(`/api/tracking/${token}/stop`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to stop tracking')
      setIsActive(false)
      toast.success('Tracking stopped.')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      padding: 20,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, justifyContent: 'center' }}>
        <div style={{
          width: 36, height: 36,
          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Radio size={18} color="#fff" />
        </div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>TrackFlow TMS</div>
      </div>

      <div className="card" style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, textAlign: 'center' }}>
          Load {loadData.load_number}
        </h2>

        {/* Route Info */}
        <div style={{ background: 'var(--bg-hover)', padding: 16, borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>PICKUP</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{loadData.pickup_city}, {loadData.pickup_state}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>DELIVERY</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{loadData.delivery_city}, {loadData.delivery_state}</div>
            </div>
          </div>
          {loadData.commodity && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Commodity: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{loadData.commodity}</span>
            </div>
          )}
        </div>

        {/* Status Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          {isActive ? (
            <>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#10b98120',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981',
                boxShadow: '0 0 0 10px #10b98110', marginBottom: 10
              }}>
                <MapPin size={40} className="animate-pulse-dot" />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent-emerald)' }}>Tracking Active</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                  Your location is being updated automatically. Please keep this tab open.
                </p>
              </div>
              <button className="btn btn-danger btn-lg" onClick={handleStop} disabled={loading} style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
                {loading ? <Loader2 className="animate-spin" /> : 'Stop Tracking'}
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#3b82f620',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6',
                marginBottom: 10
              }}>
                <Truck size={40} />
              </div>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Location Consent</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  TrackFlow requires your location to provide real-time updates to the dispatcher and customer.
                  This helps reduce check calls while you drive.
                </p>
                <div style={{ background: '#f59e0b20', color: '#f59e0b', padding: 12, borderRadius: 8, marginTop: 16, fontSize: 12, display: 'flex', gap: 8, textAlign: 'left' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  Your location is only tracked while this load is active and this tab remains open.
                </div>
              </div>

              {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: 12 }}>
                  Error: {error}. Please ensure location permissions are granted in your browser.
                </div>
              )}

              <button className="btn btn-primary btn-lg" onClick={handleAccept} disabled={loading} style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
                {loading ? <Loader2 className="animate-spin" /> : 'Accept & Start Tracking'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
