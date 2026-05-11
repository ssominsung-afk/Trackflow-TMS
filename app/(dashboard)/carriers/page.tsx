import { createClient } from '@/lib/supabase/server'
import { CheckCircle, AlertTriangle, Building2, User, Phone, Mail } from 'lucide-react'
import ComplianceScoreCard from '@/components/carriers/ComplianceScoreCard'

import AddCarrierButton from '@/components/carriers/AddCarrierButton'

export default async function CarriersPage() {
  const supabase = await createClient()

  const { data: carriers = [] } = await supabase
    .from('carriers')
    .select('*')
    .order('name')

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Carriers</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Manage carrier network and compliance
          </p>
        </div>
        <AddCarrierButton />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
        {(carriers || []).map(c => (
          <div key={c.id} className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
            {/* Carrier Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 8,
                  background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-blue)', flexShrink: 0
                }}>
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {c.name}
                    {c.is_active ? (
                      <span className="badge badge-green">Active</span>
                    ) : (
                      <span className="badge badge-gray">Inactive</span>
                    )}
                  </h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                    MC/DOT: {c.mc_number ?? 'N/A'} • Since {new Date(c.created_at).getFullYear()}
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <User size={14} /> {c.contact_name ?? 'No Contact'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Phone size={14} /> {c.contact_phone ?? 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Mail size={14} /> {c.contact_email ?? 'N/A'}
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div>
              <ComplianceScoreCard carrier={c} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
