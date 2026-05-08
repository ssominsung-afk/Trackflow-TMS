import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CustomerTrackingView from '@/components/customer/CustomerTrackingView'

export default async function CustomerPortalPage({ params }: { params: Promise<{ customerId: string }> }) {
  const { customerId } = await params
  const supabase = await createClient()

  // Validate customer
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (!customer) notFound()

  // Get customer loads
  const { data: loads = [] } = await supabase
    .from('loads')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Portal TopBar (Simplified) */}
      <div style={{ 
        height: 'var(--topbar-h)', background: 'var(--bg-surface)', 
        borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 24px' 
      }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
          TrackFlow<span style={{ color: 'var(--accent-blue)' }}>.</span> <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Customer Portal</span>
        </div>
      </div>

      <CustomerTrackingView customerName={customer.name} loads={loads || []} />
    </div>
  )
}
