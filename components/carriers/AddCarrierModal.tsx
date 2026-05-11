'use client'

import { useState } from 'react'
import { X, Building2, Save, User, Phone, Mail, ShieldAlert } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AddCarrierModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddCarrierModal({ isOpen, onClose }: AddCarrierModalProps) {
  const router = useRouter()
  const supabase = createClient()
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log('Submitting carrier data:', formData)
    setLoading(true)

    if (!formData.name) {
      toast.error('Carrier name is required')
      setLoading(false)
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error } = await supabase
        .from('carriers')
        .insert([{
          name: formData.name,
          mc_number: formData.mc_number || null,
          dot_number: formData.dot_number || null,
          contact: formData.contact || null,
          email: formData.email || null,
          phone: formData.phone || null,
          insurance_exp: formData.insurance_exp || null,
          is_active: formData.is_active,
          // If we have a company_id in user_metadata or similar, we should use it
          company_id: user?.user_metadata?.company_id || null
        }])

      if (error) throw error

      console.log('Carrier added successfully')
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
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 20,
    }}>
      <div 
        className="animate-fade-in card"
        style={{
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          background: 'var(--bg-surface)',
          padding: 0,
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--accent-blue-glow)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Building2 size={18} color="var(--accent-blue)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Add New Carrier</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="label">Carrier Name *</label>
              <input 
                className="input"
                placeholder="e.g. Swift Logistics"
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

            <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={12} /> Contact Information
              </h4>
            </div>

            <div>
              <label className="label">Contact Name</label>
              <input 
                className="input"
                placeholder="Name"
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

            <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={12} /> Compliance & Status
              </h4>
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
                style={{ width: 18, height: 18, accentColor: 'var(--accent-blue)' }}
               />
               <label htmlFor="is_active" style={{ fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>Active Carrier</label>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ 
            marginTop: 32, 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: 12,
            borderTop: '1px solid var(--border)',
            paddingTop: 24,
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
              onClick={handleSubmit}
              disabled={loading}
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
    </div>
  )
}
