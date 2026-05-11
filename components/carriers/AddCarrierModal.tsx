'use client'

import { useState } from 'react'
import { X, Building2, Save, User, Phone, Mail, ShieldAlert } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { addCarrier } from '@/app/(dashboard)/carriers/actions'

interface AddCarrierModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddCarrierModal({ isOpen, onClose }: AddCarrierModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    mc_number: '',
    dot_number: '',
    contact: '',
    email: '',
    phone: '',
    insurance_exp: '',
    is_active: true,
  })

  if (!isOpen) return null

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    
    if (!formData.name) {
      toast.error('Carrier name is required')
      const container = document.getElementById('modal-scroll-body')
      if (container) container.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setLoading(true)
    try {
      await addCarrier({
        name: formData.name,
        mc_number: formData.mc_number || undefined,
        dot_number: formData.dot_number || undefined,
        contact: formData.contact || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        insurance_exp: formData.insurance_exp || undefined,
        is_active: formData.is_active
      })

      toast.success('Carrier added successfully')
      router.refresh()
      onClose()
    } catch (err: any) {
      console.error('Error adding carrier:', err)
      toast.error(err.message || 'Failed to add carrier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'flex-start', // Changed from center to ensure top is visible
      justifyContent: 'center',
      zIndex: 100,
      padding: '40px 0', // Added padding
      overflowY: 'auto', // Allow scrolling the overlay if the screen is tiny
    }}>
      <div 
        className="card"
        style={{
          width: '95%',
          maxWidth: 600,
          background: 'var(--bg-surface)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 40px 150px rgba(0,0,0,0.95)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          borderRadius: 16,
          position: 'relative',
          minHeight: '500px', // Force a reasonable height
        }}
      >
        {/* Fixed Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--accent-blue-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={18} color="var(--accent-blue)" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Add New Carrier <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>v1.1</span></h2>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>Please enter the official company name below</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'var(--bg-hover)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div 
          id="modal-scroll-body"
          style={{ 
            padding: '24px 24px 32px 24px', 
            overflowY: 'auto',
            flex: 1,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label" style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Carrier Name *</label>
              <input 
                autoFocus
                className="input"
                style={{ border: '1px solid var(--accent-blue)', background: 'rgba(59, 130, 246, 0.05)' }}
                placeholder="Required: e.g. Swift Logistics"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="label">MC Number</label>
              <input 
                className="input"
                placeholder="MC#"
                value={formData.mc_number}
                onChange={e => setFormData({ ...formData, mc_number: e.target.value })}
              />
            </div>
            <div>
              <label className="label">DOT Number</label>
              <input 
                className="input"
                placeholder="DOT#"
                value={formData.dot_number}
                onChange={e => setFormData({ ...formData, dot_number: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: 12 }}>
              <div style={{ 
                padding: '12px 16px', 
                background: 'var(--bg-hover)', 
                borderRadius: 8, 
                border: '1px solid var(--border)',
                marginBottom: 16
              }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={13} /> Contact Details
                </h4>
              </div>
            </div>

            <div>
              <label className="label">Contact Name</label>
              <input 
                className="input"
                placeholder="Primary contact"
                value={formData.contact}
                onChange={e => setFormData({ ...formData, contact: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input 
                className="input"
                placeholder="Phone"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Email Address</label>
              <input 
                type="email"
                className="input"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: 12 }}>
              <div style={{ 
                padding: '12px 16px', 
                background: 'var(--bg-hover)', 
                borderRadius: 8, 
                border: '1px solid var(--border)',
                marginBottom: 16
              }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ShieldAlert size={13} /> Compliance & Status
                </h4>
              </div>
            </div>

            <div>
              <label className="label">Insurance Expiration</label>
              <input 
                type="date"
                className="input"
                value={formData.insurance_exp}
                onChange={e => setFormData({ ...formData, insurance_exp: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, alignSelf: 'center', marginTop: 15 }}>
               <input 
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
               />
               <label htmlFor="is_active" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Active Carrier</label>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div style={{ 
          padding: '20px 24px', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 12,
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => handleSubmit()}
            disabled={loading}
            style={{ minWidth: 140 }}
          >
            {loading ? (
              <div className="spinner" style={{ width: 14, height: 14 }} />
            ) : (
              <>
                <Save size={16} />
                Add Carrier
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
