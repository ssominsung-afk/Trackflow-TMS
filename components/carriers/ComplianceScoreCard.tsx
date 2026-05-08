'use client'

import { CheckCircle, AlertTriangle, ShieldCheck, FileText } from 'lucide-react'
import type { Carrier } from '@/types'

interface Props {
  carrier: Carrier
}

export default function ComplianceScoreCard({ carrier }: Props) {
  // Mock compliance calculation
  const isCompliant = carrier.insurance_exp ? new Date(carrier.insurance_exp) > new Date() : false
  const score = isCompliant ? 98 : 45
  const riskColor = score > 80 ? 'var(--accent-emerald)' : score > 60 ? 'var(--accent-amber)' : 'var(--accent-red)'

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShieldCheck size={18} color={riskColor} />
            Compliance Score
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Based on historical performance & docs</p>
        </div>
        <div style={{
          fontSize: 32, fontWeight: 800, color: riskColor,
          background: `${riskColor}15`, padding: '8px 16px', borderRadius: 8
        }}>
          {score}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} color="var(--accent-emerald)" /> On-Time Delivery
          </span>
          <span style={{ fontWeight: 600 }}>96%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} color="var(--accent-emerald)" /> Tracking Adoption
          </span>
          <span style={{ fontWeight: 600 }}>92%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            {isCompliant ? <CheckCircle size={14} color="var(--accent-emerald)" /> : <AlertTriangle size={14} color="var(--accent-red)" />}
            Insurance Valid
          </span>
          <span style={{ fontWeight: 600, color: isCompliant ? 'inherit' : 'var(--accent-red)' }}>
            {carrier.insurance_exp ? new Date(carrier.insurance_exp).toLocaleDateString() : 'Missing'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
          <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={14} color="var(--text-muted)" /> W9 on file
          </span>
          <span style={{ fontWeight: 600 }}>Yes</span>
        </div>
      </div>
    </div>
  )
}
