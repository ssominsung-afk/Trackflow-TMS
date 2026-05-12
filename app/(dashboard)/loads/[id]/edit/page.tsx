'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save, Copy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Customer, Carrier, Driver, CreateLoadPayload } from '@/types'
import { generateLoadNumber } from '@/lib/utils'

const TRAILER_TYPES = ['Dry Van', 'Reefer', 'Flatbed', 'Step Deck', 'RGN', 'Box Truck', 'Tanker', 'Conestoga', 'Other']
const STATUSES = ['booked','dispatched','at_pickup','loaded','in_transit','at_delivery','delivered','pod_uploaded','completed','cancelled','exception']
const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

interface Props {
  params: Promise<{ id: string }>
}

export default function LoadFormPage({ params }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [loadId, setLoadId] = useState<string | null>(null)
  const [isEdit, setIsEdit] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [trackingToken, setTrackingToken] = useState<string>('')

  const [form, setForm] = useState({
    load_number: generateLoadNumber(),
    customer_id: '',
    carrier_id: '',
    driver_id: '',
    status: 'booked',

    pickup_name: '',
    pickup_address: '',
    pickup_city: '',
    pickup_state: 'GA',
    pickup_zip: '',
    pickup_scheduled: '',

    delivery_name: '',
    delivery_address: '',
    delivery_city: '',
    delivery_state: '',
    delivery_zip: '',
    delivery_scheduled: '',

    commodity: '',
    weight_lbs: '',
    pieces: '',
    trailer_type: 'Dry Van',
    temperature: '',
    rate_usd: '',
    carrier_pay_usd: '',
    special_instructions: '',
    dispatcher_notes: '',
  })

  useEffect(() => {
    async function init() {
      setLoading(true)
      const { id } = await params
      const isEditMode = id !== 'new'
      setIsEdit(isEditMode)
      setLoadId(id)

      const [{ data: custs }, { data: cars }] = await Promise.all([
        supabase.from('customers').select('*').order('name'),
        supabase.from('carriers').select('*').eq('is_active', true).order('name'),
      ])
      setCustomers(custs ?? [])
      setCarriers(cars ?? [])

      if (isEditMode) {
        const { data: load } = await supabase
          .from('loads')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (load) {
          setTrackingToken(load.tracking_token ?? '')
          setForm({
            load_number: load.load_number,
            customer_id: load.customer_id ?? '',
            carrier_id: load.carrier_id ?? '',
            driver_id: load.driver_id ?? '',
            status: load.status,
            pickup_name: load.pickup_name ?? '',
            pickup_address: load.pickup_address ?? '',
            pickup_city: load.pickup_city,
            pickup_state: load.pickup_state,
            pickup_zip: load.pickup_zip ?? '',
            pickup_scheduled: load.pickup_scheduled ? load.pickup_scheduled.slice(0,16) : '',
            delivery_name: load.delivery_name ?? '',
            delivery_address: load.delivery_address ?? '',
            delivery_city: load.delivery_city,
            delivery_state: load.delivery_state,
            delivery_zip: load.delivery_zip ?? '',
            delivery_scheduled: load.delivery_scheduled ? load.delivery_scheduled.slice(0,16) : '',
            commodity: load.commodity ?? '',
            weight_lbs: load.weight_lbs?.toString() ?? '',
            pieces: load.pieces?.toString() ?? '',
            trailer_type: load.trailer_type ?? 'Dry Van',
            temperature: load.temperature ?? '',
            rate_usd: load.rate_usd?.toString() ?? '',
            carrier_pay_usd: load.carrier_pay_usd?.toString() ?? '',
            special_instructions: load.special_instructions ?? '',
            dispatcher_notes: load.dispatcher_notes ?? '',
          })
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    async function loadDrivers() {
      if (!form.carrier_id) { setDrivers([]); return }
      const { data } = await supabase
        .from('drivers')
        .select('*')
        .eq('carrier_id', form.carrier_id)
        .eq('is_active', true)
        .order('full_name')
      setDrivers(data ?? [])
    }
    loadDrivers()
  }, [form.carrier_id])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload: any = {
        ...form,
        weight_lbs: form.weight_lbs ? parseInt(form.weight_lbs) : null,
        pieces: form.pieces ? parseInt(form.pieces) : null,
        rate_usd: form.rate_usd ? parseFloat(form.rate_usd) : null,
        carrier_pay_usd: form.carrier_pay_usd ? parseFloat(form.carrier_pay_usd) : null,
        pickup_scheduled: form.pickup_scheduled || null,
        delivery_scheduled: form.delivery_scheduled || null,
        customer_id: form.customer_id || null,
        carrier_id: form.carrier_id || null,
        driver_id: form.driver_id || null,
      }

      if (isEdit && loadId) {
        const { error } = await supabase.from('loads').update(payload).eq('id', loadId)
        if (error) throw error
        toast.success('Load updated')
        router.push(`/loads/${loadId}`)
      } else {
        const { data, error } = await supabase.from('loads').insert(payload).select().single()
        if (error) throw error
        setTrackingToken(data.tracking_token)
        toast.success('Load created! Tracking link ready.')
        router.push(`/loads/${data.id}`)
      }
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 10 }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text-muted)' }}>Loading...</span>
    </div>
  )

  const trackingUrl = trackingToken
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/tracking/${trackingToken}`
    : null

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href="/loads" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back</Link>
        <span style={{ color: 'var(--border)' }}>|</span>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>
          {isEdit ? `Edit ${form.load_number}` : 'New Load'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Basic */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Basic Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">Load Number</label>
                  <input className="input" value={form.load_number} onChange={e => set('load_number', e.target.value)} required />
                </div>
                <div>
                  <label className="label">Customer</label>
                  <select className="input" value={form.customer_id} onChange={e => set('customer_id', e.target.value)}>
                    <option value="">Select customer...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                {isEdit && (
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-blue)', marginRight: 8 }} />
                Pickup
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div><label className="label">Facility Name</label><input className="input" value={form.pickup_name} onChange={e => set('pickup_name', e.target.value)} placeholder="ABC Warehouse" /></div>
                <div><label className="label">Address</label><input className="input" value={form.pickup_address} onChange={e => set('pickup_address', e.target.value)} placeholder="123 Main St" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                  <div><label className="label">City</label><input className="input" value={form.pickup_city} onChange={e => set('pickup_city', e.target.value)} required /></div>
                  <div>
                    <label className="label">State</label>
                    <select className="input" value={form.pickup_state} onChange={e => set('pickup_state', e.target.value)}>
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="label">ZIP</label><input className="input" value={form.pickup_zip} onChange={e => set('pickup_zip', e.target.value)} /></div>
                </div>
                <div><label className="label">Scheduled Time</label><input className="input" type="datetime-local" value={form.pickup_scheduled} onChange={e => set('pickup_scheduled', e.target.value)} /></div>
              </div>
            </div>

            {/* Delivery */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-emerald)', marginRight: 8 }} />
                Delivery
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div><label className="label">Facility Name</label><input className="input" value={form.delivery_name} onChange={e => set('delivery_name', e.target.value)} placeholder="XYZ Distribution" /></div>
                <div><label className="label">Address</label><input className="input" value={form.delivery_address} onChange={e => set('delivery_address', e.target.value)} placeholder="456 Oak Ave" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 8 }}>
                  <div><label className="label">City</label><input className="input" value={form.delivery_city} onChange={e => set('delivery_city', e.target.value)} required /></div>
                  <div>
                    <label className="label">State</label>
                    <select className="input" value={form.delivery_state} onChange={e => set('delivery_state', e.target.value)}>
                      <option value="">State</option>
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="label">ZIP</label><input className="input" value={form.delivery_zip} onChange={e => set('delivery_zip', e.target.value)} /></div>
                </div>
                <div><label className="label">Scheduled Time</label><input className="input" type="datetime-local" value={form.delivery_scheduled} onChange={e => set('delivery_scheduled', e.target.value)} /></div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Carrier */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Carrier & Driver</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label className="label">Carrier</label>
                  <select className="input" value={form.carrier_id} onChange={e => set('carrier_id', e.target.value)}>
                    <option value="">Select carrier...</option>
                    {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Driver</label>
                  <select className="input" value={form.driver_id} onChange={e => set('driver_id', e.target.value)} disabled={!form.carrier_id}>
                    <option value="">Select driver...</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Cargo */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Cargo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div><label className="label">Commodity</label><input className="input" value={form.commodity} onChange={e => set('commodity', e.target.value)} placeholder="e.g. Frozen Food" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div><label className="label">Weight (lbs)</label><input className="input" type="number" value={form.weight_lbs} onChange={e => set('weight_lbs', e.target.value)} placeholder="42000" /></div>
                  <div><label className="label">Pieces</label><input className="input" type="number" value={form.pieces} onChange={e => set('pieces', e.target.value)} placeholder="24" /></div>
                </div>
                <div>
                  <label className="label">Trailer Type</label>
                  <select className="input" value={form.trailer_type} onChange={e => set('trailer_type', e.target.value)}>
                    {TRAILER_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="label">Temperature (Reefer)</label><input className="input" value={form.temperature} onChange={e => set('temperature', e.target.value)} placeholder="e.g. 34°F" /></div>
              </div>
            </div>

            {/* Financials */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Financials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label className="label">Customer Rate ($)</label><input className="input" type="number" step="0.01" value={form.rate_usd} onChange={e => set('rate_usd', e.target.value)} placeholder="3200.00" /></div>
                <div><label className="label">Carrier Pay ($)</label><input className="input" type="number" step="0.01" value={form.carrier_pay_usd} onChange={e => set('carrier_pay_usd', e.target.value)} placeholder="2400.00" /></div>
              </div>
            </div>

            {/* Notes */}
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>Notes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <label className="label">Special Instructions</label>
                  <textarea className="input" rows={3} value={form.special_instructions} onChange={e => set('special_instructions', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <div>
                  <label className="label">Dispatcher Notes (internal)</label>
                  <textarea className="input" rows={2} value={form.dispatcher_notes} onChange={e => set('dispatcher_notes', e.target.value)} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>

            {/* Tracking Link (after save) */}
            {trackingUrl && (
              <div className="card" style={{ padding: 16, borderColor: 'var(--accent-blue)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>DRIVER TRACKING LINK</div>
                <div style={{ fontSize: 12, color: 'var(--accent-blue)', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 8 }}>
                  {trackingUrl}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => { navigator.clipboard.writeText(trackingUrl); toast.success('Copied!') }}
                >
                  <Copy size={12} /> Copy Link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Link href="/loads" className="btn btn-secondary">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {isEdit ? 'Save Changes' : 'Create Load'}
          </button>
        </div>
      </form>
    </div>
  )
}
