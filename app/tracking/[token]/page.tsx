import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DriverTrackingConsent from '@/components/map/DriverTrackingConsent'

export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Validate tracking token
  const { data: load } = await supabase
    .from('loads')
    .select('id, load_number, pickup_city, pickup_state, delivery_city, delivery_state, commodity, status')
    .eq('tracking_token', token)
    .single()

  if (!load) notFound()

  // If already delivered, don't allow tracking
  if (['delivered', 'pod_uploaded', 'completed', 'cancelled'].includes(load.status)) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Load Complete</h2>
        <p>This load is no longer active. Tracking is disabled.</p>
      </div>
    )
  }

  return <DriverTrackingConsent token={token} loadData={load} />
}
