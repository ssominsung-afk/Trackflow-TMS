import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Edit, Copy, MapPin, Truck, Package,
  Clock, FileText, AlertTriangle, CheckCircle
} from 'lucide-react'
import LoadStatusBadge from '@/components/loads/LoadStatusBadge'
import LocationTimeline from '@/components/loads/LocationTimeline'
import { formatDate, formatCurrency, formatWeight, RISK_COLORS } from '@/lib/utils'

export default async function LoadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: load } = await supabase
    .from('loads')
    .select(`
      *,
      customer:customers(name, email, phone, city, state),
      carrier:carriers(name, mc_number, phone, email),
      driver:drivers(full_name, phone)
    `)
    .eq('id', id)
    .maybeSingle()

  if (!load) notFound()

  const { data: events = [] } = await supabase
    .from('load_events')
    .select('*, actor:user_profiles(full_name)')
    .eq('load_id', id)
    .order('created_at', { ascending: false })

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('load_id', id)
    .order('created_at', { ascending: false })

  const safeDocs = documents || []

  const { data: recentPing } = await supabase
    .from('location_pings')
    .select('*')
    .eq('load_id', id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tracking/${load.tracking_token}`
  const riskLevel = load.risk_level as keyof typeof RISK_COLORS || 'on_time'
  const riskColor = RISK_COLORS[riskLevel] || RISK_COLORS.on_time

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb + Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/loads" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> Back
          </Link>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{load.load_number}</span>
          <LoadStatusBadge status={load.status} pulse />
          {load.risk_level !== 'on_time' && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 11, fontWeight: 600,
              color: riskColor.text.replace('text-', ''),
              background: riskColor.bg.replace('bg-', ''),
              padding: '3px 8px', borderRadius: 6,
            }}>
              <AlertTriangle size={11} />
              {load.risk_level === 'at_risk' ? 'At Risk' : 'Late'}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {}}
          >
            <Copy size={13} /> Copy Tracking Link
          </button>
          <Link href={`/loads/${id}/edit`} className="btn btn-primary btn-sm">
            <Edit size={13} /> Edit
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Load Details */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
              Load Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Commodity', value: load.commodity },
                { label: 'Weight', value: formatWeight(load.weight_lbs) },
                { label: 'Pieces', value: load.pieces?.toString() },
                { label: 'Trailer', value: load.trailer_type },
                { label: 'Rate', value: formatCurrency(load.rate_usd) },
                { label: 'Carrier Pay', value: formatCurrency(load.carrier_pay_usd) },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value ?? '—'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Route */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Route</h3>

            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-blue)' }} />
                <div style={{ width: 2, height: 36, background: 'var(--border)' }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {load.pickup_city}, {load.pickup_state} {load.pickup_zip}
                  </div>
                  {load.pickup_name && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{load.pickup_name}</div>
                  )}
                  {load.pickup_address && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{load.pickup_address}</div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Scheduled: {formatDate(load.pickup_scheduled)}
                    {load.pickup_actual && <> · Actual: {formatDate(load.pickup_actual)}</>}
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {load.delivery_city}, {load.delivery_state} {load.delivery_zip}
                  </div>
                  {load.delivery_name && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{load.delivery_name}</div>
                  )}
                  {load.delivery_address && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{load.delivery_address}</div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Scheduled: {formatDate(load.delivery_scheduled)}
                    {load.delivery_actual && <> · Actual: {formatDate(load.delivery_actual)}</>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carrier / Driver */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
              Carrier & Driver
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { label: 'Carrier', value: (load as any).carrier?.name },
                { label: 'MC #', value: (load as any).carrier?.mc_number },
                { label: 'Carrier Phone', value: (load as any).carrier?.phone },
                { label: 'Carrier Email', value: (load as any).carrier?.email },
                { label: 'Driver', value: (load as any).driver?.full_name },
                { label: 'Driver Phone', value: (load as any).driver?.phone },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{item.value ?? '—'}</div>
                </div>
              ))}
            </div>

            {/* Tracking link */}
            <div style={{
              marginTop: 16,
              padding: 12,
              background: 'var(--bg-hover)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
                DRIVER TRACKING LINK
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent-blue)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {trackingUrl}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Documents ({safeDocs.length})
            </h3>
            {safeDocs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 16 }}>
                No documents uploaded yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {safeDocs.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'var(--bg-surface)',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <FileText size={14} color="var(--accent-blue)" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{doc.file_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {doc.doc_type.toUpperCase()} · {formatDate(doc.created_at)}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Map placeholder */}
          <div className="card" style={{
            padding: 0,
            overflow: 'hidden',
            height: 380,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <MapPin size={15} color="var(--accent-blue)" />
              <span style={{ fontWeight: 600, fontSize: 14 }}>Live Location</span>
              {recentPing && (
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
                  Last ping: {formatDate(recentPing.created_at, 'h:mm a')}
                </span>
              )}
            </div>
            <div style={{
              flex: 1,
              background: 'var(--bg-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
              color: 'var(--text-muted)',
            }}>
              <MapPin size={32} />
              {recentPing ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {recentPing.city}, {recentPing.state}
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {recentPing.lat.toFixed(4)}, {recentPing.lng.toFixed(4)}
                  </div>
                  {recentPing.speed_mph && (
                    <div style={{ fontSize: 12 }}>{recentPing.speed_mph} mph</div>
                  )}
                </div>
              ) : (
                <div style={{ fontSize: 13, textAlign: 'center' }}>
                  <div>No active tracking</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Send the driver tracking link to start</div>
                </div>
              )}
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Google Maps integration requires API key
              </div>
            </div>
          </div>

          {/* Customer */}
          {(load as any).customer && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
                Customer
              </h3>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{(load as any).customer.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(load as any).customer.email && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{(load as any).customer.email}</div>
                )}
                {(load as any).customer.phone && (
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{(load as any).customer.phone}</div>
                )}
                {(load as any).customer.city && (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {(load as any).customer.city}, {(load as any).customer.state}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Event Timeline */}
          <div className="card" style={{ padding: 20, flex: 1 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
              Status History
            </h3>
            <LocationTimeline events={events as any} />
          </div>
        </div>
      </div>
    </div>
  )
}
