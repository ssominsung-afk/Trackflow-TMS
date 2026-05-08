import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()

  // Find load
  const { data: load } = await supabase
    .from('loads')
    .select('id')
    .eq('tracking_token', token)
    .single()

  if (!load) return NextResponse.json({ error: 'Invalid token' }, { status: 404 })

  // Upsert tracking session
  const { error } = await supabase
    .from('tracking_sessions')
    .insert({
      load_id: load.id,
      status: 'active',
      consent_at: new Date().toISOString(),
      consent_ip: req.headers.get('x-forwarded-for') || 'unknown',
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Log event
  await supabase.from('load_events').insert({
    load_id: load.id,
    event_type: 'tracking_started',
    notes: 'Driver accepted tracking consent.',
  })

  // Update load status to dispatched if it was booked
  await supabase.from('loads').update({ status: 'dispatched' }).eq('id', load.id).eq('status', 'booked')

  return NextResponse.json({ success: true })
}
