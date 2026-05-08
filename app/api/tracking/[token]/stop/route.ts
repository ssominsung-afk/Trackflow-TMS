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

  // Stop tracking session
  const { error } = await supabase
    .from('tracking_sessions')
    .update({
      status: 'stopped',
      stopped_at: new Date().toISOString(),
      stop_reason: 'driver_requested',
    })
    .eq('load_id', load.id)
    .eq('status', 'active')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Log event
  await supabase.from('load_events').insert({
    load_id: load.id,
    event_type: 'tracking_stopped',
    notes: 'Driver manually stopped tracking.',
  })

  return NextResponse.json({ success: true })
}
