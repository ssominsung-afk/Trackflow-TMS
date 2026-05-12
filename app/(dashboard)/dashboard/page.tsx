import { createClient } from '@/lib/supabase/server'
import {
  Package, Truck, AlertTriangle, TrendingUp,
  CheckCircle, FileX, BarChart3, Zap
} from 'lucide-react'
import Link from 'next/link'
import type { Load } from '@/types'
import LoadStatusBadge from '@/components/loads/LoadStatusBadge'
import { formatDate, RISK_COLORS } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch loads with relations
  const { data: loads, error } = await supabase
    .from('loads')
    .select('*, carrier:carriers(name), customer:customers(name), driver:drivers(full_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div style={{ padding: 24, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: 12, color: '#ef4444' }}>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Database Error</h3>
        <p style={{ fontSize: 13 }}>{error.message}</p>
      </div>
    )
  }

  // Compute stats
  const safeLoads = loads || []
  
  const activeLoads = safeLoads.filter(l =>
    l?.status && ['dispatched','at_pickup','loaded','in_transit','at_delivery'].includes(l.status)
  ).length

  const today = new Date().toDateString()
  const deliveredToday = safeLoads.filter(l =>
    l?.status === 'delivered' && l.delivery_actual &&
    new Date(l.delivery_actual).toString() !== 'Invalid Date' &&
    new Date(l.delivery_actual).toDateString() === today
  ).length

  const lateRiskLoads = safeLoads.filter(l => l?.risk_level === 'late').length
  const atRiskLoads = safeLoads.filter(l => l?.risk_level === 'at_risk').length

  const podMissing = safeLoads.filter(l =>
    l.status === 'delivered' && !['pod_uploaded','completed'].includes(l.status)
  ).length

  const exceptionFeed = safeLoads.filter(l =>
    ['exception','late'].includes(l.status) || l.risk_level === 'late' || l.risk_level === 'at_risk'
  ).slice(0, 8)

  const recentLoads = safeLoads.slice(0, 8)

  const STATS = [
    { label: 'Active Loads', value: activeLoads, icon: Package, color: '#3b82f6', bg: '#3b82f610' },
    { label: 'Delivered Today', value: deliveredToday, icon: CheckCircle, color: '#10b981', bg: '#10b98110' },
    { label: 'Late Risk', value: lateRiskLoads, icon: AlertTriangle, color: '#ef4444', bg: '#ef444410' },
    { label: 'At Risk', value: atRiskLoads, icon: TrendingUp, color: '#f59e0b', bg: '#f59e0b10' },
    { label: 'POD Missing', value: podMissing, icon: FileX, color: '#8b5cf6', bg: '#8b5cf610' },
    { label: 'Total Loads', value: safeLoads.length, icon: BarChart3, color: '#6366f1', bg: '#6366f110' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Operations Overview</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Real-time freight visibility across all active loads
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
        marginBottom: 32,
      }}>
        {STATS.map(stat => {
          const Icon = stat.icon
          return (
            <div className="stat-card" key={stat.label}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={stat.color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          )
        })}
      </div>

      {/* Two-column: Exception feed + Recent loads */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Exception Feed */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Zap size={16} color="var(--accent-amber)" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Exception Feed</span>
            {exceptionFeed.length > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: '#ef444420',
                color: '#ef4444',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 20,
              }}>{exceptionFeed.length}</span>
            )}
          </div>
          <div>
            {exceptionFeed.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={28} color="var(--accent-emerald)" />
                <p style={{ color: 'var(--text-secondary)' }}>All loads on track</p>
              </div>
            ) : (
              exceptionFeed.map(load => {
                const riskLevel = load.risk_level as keyof typeof RISK_COLORS || 'on_time'
                const rc = RISK_COLORS[riskLevel] || RISK_COLORS.on_time
                return (
                  <Link key={load.id} href={`/loads/${load.id}`}>
                    <div style={{
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'background 0.1s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                          {load.load_number}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                          {load.pickup_city} → {load.delivery_city}
                        </div>
                      </div>
                      <LoadStatusBadge status={load.status} size="sm" />
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Loads */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Package size={16} color="var(--accent-blue)" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Recent Loads</span>
            <Link href="/loads" style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--accent-blue)' }}>
              View all →
            </Link>
          </div>
          <div>
            {recentLoads.map(load => (
              <Link key={load.id} href={`/loads/${load.id}`}>
                <div
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
                      {load.load_number}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {load.pickup_city}, {load.pickup_state} → {load.delivery_city}, {load.delivery_state}
                    </div>
                    {load.delivery_scheduled && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        ETA: {formatDate(load.delivery_scheduled, 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>
                  <LoadStatusBadge status={load.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
