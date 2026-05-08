import { createClient } from '@/lib/supabase/server'
import LiveMap from '@/components/map/LiveMap'

export default async function FullScreenMapPage() {
  const supabase = await createClient()

  // Fetch all active loads with location data
  const { data: loads } = await supabase
    .from('loads')
    .select('*')
    .in('status', ['dispatched', 'at_pickup', 'loaded', 'in_transit', 'at_delivery'])

  const safeLoads = loads || []

  // Get the latest ping for each active load to show drivers on map
  const pings = []
  for (const load of safeLoads) {
    const { data: ping } = await supabase
      .from('location_pings')
      .select('*')
      .eq('load_id', load.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    if (ping) pings.push(ping)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-h) - 48px)' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Live Tracking Map</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Real-time positions of {pings.length} active drivers
        </p>
      </div>

      <div className="card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
        <LiveMap loads={safeLoads} pings={pings} />
      </div>
    </div>
  )
}
