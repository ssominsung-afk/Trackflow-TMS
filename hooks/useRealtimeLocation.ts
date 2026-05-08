import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { LocationPing } from '@/types'

export function useRealtimeLocation(loadId: string | null) {
  const [pings, setPings] = useState<LocationPing[]>([])
  const supabase = createClient()

  useEffect(() => {
    if (!loadId) return

    // Fetch historical pings
    supabase
      .from('location_pings')
      .select('*')
      .eq('load_id', loadId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setPings(data)
      })

    // Subscribe to new pings
    const channel = supabase
      .channel(`location_pings:${loadId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'location_pings', filter: `load_id=eq.${loadId}` },
        (payload) => {
          setPings((prev) => [...prev, payload.new as LocationPing])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadId])

  return pings
}
