'use client'

import { useState } from 'react'
import { Package, MapPin, Truck, Calendar, Clock, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Load } from '@/types'

interface Props {
  customerName: string
  loads: Load[]
}

export default function CustomerTrackingView({ customerName, loads }: Props) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active')

  const filteredLoads = loads.filter(l => {
    const isCompleted = ['delivered', 'completed'].includes(l.status)
    if (filter === 'active') return !isCompleted
    if (filter === 'completed') return isCompleted
    return true
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Welcome, {customerName}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Track your active shipments and view past deliveries.</p>
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-hover)', padding: 4, borderRadius: 8 }}>
          <button
            onClick={() => setFilter('active')}
            className={`btn btn-sm ${filter === 'active' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Active ({loads.filter(l => !['delivered', 'completed'].includes(l.status)).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Completed ({loads.filter(l => ['delivered', 'completed'].includes(l.status)).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          >
            All
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filteredLoads.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>No {filter} shipments</h3>
            <p style={{ marginTop: 8 }}>You don't have any {filter} shipments at this time.</p>
          </div>
        ) : (
          filteredLoads.map(load => (
            <div key={load.id} className="card" style={{ padding: 24, display: 'flex', gap: 24, alignItems: 'center' }}>
              
              {/* Status Icon */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: ['delivered', 'completed'].includes(load.status) ? 'var(--accent-emerald-glow)' : 'var(--accent-blue-glow)',
                color: ['delivered', 'completed'].includes(load.status) ? 'var(--accent-emerald)' : 'var(--accent-blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {['delivered', 'completed'].includes(load.status) ? <CheckCircle size={28} /> : <Truck size={28} />}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Load {load.load_number}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{load.commodity} • {load.weight_lbs} lbs</p>
                  </div>
                  <div className={`badge badge-${['delivered', 'completed'].includes(load.status) ? 'green' : 'blue'}`}>
                    {load.status.replace(/_/g, ' ').toUpperCase()}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, background: 'var(--bg-base)', padding: 16, borderRadius: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>PICKUP</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{load.pickup_city}, {load.pickup_state}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={12} /> {load.pickup_scheduled ? formatDate(load.pickup_scheduled) : 'TBD'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>DELIVERY</div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{load.delivery_city}, {load.delivery_state}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={12} /> {load.delivery_scheduled ? formatDate(load.delivery_scheduled) : 'TBD'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div style={{ flexShrink: 0, width: 140, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['in_transit', 'loaded', 'at_delivery'].includes(load.status) && load.tracking_token && (
                  <a
                    href={`/tracking/${load.tracking_token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <MapPin size={14} /> Live Map
                  </a>
                )}
                {/* Normally we'd link to public documents here, but keeping MVP simple */}
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  )
}
