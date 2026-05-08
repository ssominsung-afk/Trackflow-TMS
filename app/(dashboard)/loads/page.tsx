import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'
import LoadStatusBadge from '@/components/loads/LoadStatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Load } from '@/types'

export default async function LoadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('loads')
    .select('*, carrier:carriers(name), customer:customers(name), driver:drivers(full_name)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (q) query = query.ilike('load_number', `%${q}%`)

  const { data: loads } = await query
  const safeLoads = loads || []

  const STATUS_FILTERS = [
    { value: '', label: 'All' },
    { value: 'booked', label: 'Booked' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'exception', label: 'Exception' },
    { value: 'completed', label: 'Completed' },
  ]

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2 }}>Loads</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {safeLoads.length} load{safeLoads.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link href="/loads/new" className="btn btn-primary">
          <Plus size={15} />
          New Load
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <Link
            key={f.value}
            href={f.value ? `/loads?status=${f.value}` : '/loads'}
            className="btn btn-sm"
            style={{
              background: status === f.value || (!f.value && !status) ? 'var(--accent-blue)' : 'var(--bg-hover)',
              color: status === f.value || (!f.value && !status) ? '#fff' : 'var(--text-secondary)',
              border: '1px solid var(--border)',
            }}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Load #</th>
              <th>Customer</th>
              <th>Route</th>
              <th>Carrier / Driver</th>
              <th>Status</th>
              <th>Delivery</th>
              <th>Rate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {safeLoads.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                  No loads found
                </td>
              </tr>
            ) : (
              safeLoads.map((load: Load) => (
                <tr key={load.id}>
                  <td>
                    <Link href={`/loads/${load.id}`} style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                      {load.load_number}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {(load as any).customer?.name ?? '—'}
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>
                      {load.pickup_city}, {load.pickup_state}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      → {load.delivery_city}, {load.delivery_state}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{(load as any).carrier?.name ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {(load as any).driver?.full_name ?? '—'}
                    </div>
                  </td>
                  <td>
                    <LoadStatusBadge status={load.status} pulse />
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {formatDate(load.delivery_scheduled, 'MMM d, h:mm a')}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--accent-emerald)' }}>
                    {formatCurrency(load.rate_usd)}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/loads/${load.id}`} className="btn btn-ghost btn-sm">
                        View
                      </Link>
                      <Link href={`/loads/${load.id}/edit`} className="btn btn-ghost btn-sm">
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
