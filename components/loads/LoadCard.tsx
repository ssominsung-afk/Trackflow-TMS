import Link from 'next/link'
import { MapPin, Truck, Clock, ArrowRight, AlertTriangle } from 'lucide-react'
import type { Load } from '@/types'
import LoadStatusBadge from './LoadStatusBadge'
import { formatDate, formatCurrency, RISK_COLORS } from '@/lib/utils'

interface Props {
  load: Load
}

export default function LoadCard({ load }: Props) {
  const riskColor = RISK_COLORS[load.risk_level]

  return (
    <Link href={`/loads/${load.id}`}>
      <div className="card card-hover" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {load.load_number}
            </div>
            <LoadStatusBadge status={load.status} pulse />
          </div>
          {load.risk_level !== 'on_time' && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 600,
              color: riskColor.text.replace('text-', ''),
              background: riskColor.bg.replace('bg-', ''),
              padding: '3px 8px',
              borderRadius: 6,
            }}>
              <AlertTriangle size={11} />
              {load.risk_level === 'at_risk' ? 'At Risk' : 'Late'}
            </span>
          )}
        </div>

        {/* Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', border: '2px solid var(--bg-card)' }} />
            <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', border: '2px solid var(--bg-card)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
              {load.pickup_city}, {load.pickup_state}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
              {load.delivery_city}, {load.delivery_state}
            </div>
          </div>
          <ArrowRight size={14} color="var(--text-muted)" />
        </div>

        {/* Meta */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          {load.carrier && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {load.carrier.name}
              </span>
            </div>
          )}
          {load.delivery_scheduled && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={12} color="var(--text-muted)" />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {formatDate(load.delivery_scheduled, 'MMM d, h:mm a')}
              </span>
            </div>
          )}
          {load.rate_usd && (
            <div style={{ fontSize: 12, color: 'var(--accent-emerald)', fontWeight: 600 }}>
              {formatCurrency(load.rate_usd)}
            </div>
          )}
          {load.commodity && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {load.commodity}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
