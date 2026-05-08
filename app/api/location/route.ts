import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkGeofences } from '@/lib/geofence'
import type { LocationPingPayload } from '@/types'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { token, lat, lng, speed_mph, heading, accuracy_m } = body as LocationPingPayload & { token: string }

    if (!token || !lat || !lng) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()

    // 1. Validate token & get load + session
    const { data: load } = await supabase
      .from('loads')
      .select('id, status')
      .eq('tracking_token', token)
      .single()

    if (!load) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    if (['delivered', 'pod_uploaded', 'completed', 'cancelled'].includes(load.status)) {
      return NextResponse.json({ error: 'Load inactive' }, { status: 403 })
    }

    // Get active session
    let { data: session } = await supabase
      .from('tracking_sessions')
      .select('id')
      .eq('load_id', load.id)
      .eq('status', 'active')
      .single()

    if (!session) {
      // Auto-start session if it doesn't exist but location comes in
      const { data: newSession, error: sErr } = await supabase
        .from('tracking_sessions')
        .insert({ load_id: load.id, status: 'active', consent_at: new Date().toISOString() })
        .select()
        .single()
      if (sErr) throw sErr
      session = newSession
    }

    // 2. Insert Ping
    const { error: pingErr } = await supabase
      .from('location_pings')
      .insert({
        session_id: session!.id,
        load_id: load.id,
        lat, lng, speed_mph, heading, accuracy_m
      })

    if (pingErr) throw pingErr

    // 3. Check Geofences (Fire & Forget, or await)
    // We fetch geofences for this load that haven't been triggered
    const { data: geofences } = await supabase
      .from('geofences')
      .select('*')
      .eq('load_id', load.id)
      .eq('triggered', false)

    if (geofences && geofences.length > 0) {
      const triggers = checkGeofences(lat, lng, geofences)
      for (const t of triggers) {
        // Mark triggered
        await supabase
          .from('geofences')
          .update({ triggered: true, triggered_at: new Date().toISOString() })
          .eq('id', t.geofence.id)

        // Log Event
        await supabase
          .from('load_events')
          .insert({
            load_id: load.id,
            event_type: `geofence_${t.type}`,
            notes: `Driver entered ${t.type} geofence radius.`,
          })

        // Auto-update load status
        const newStatus = t.type === 'pickup' ? 'at_pickup' : 'at_delivery'
        await supabase
          .from('loads')
          .update({ status: newStatus })
          .eq('id', load.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Location ingest error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
