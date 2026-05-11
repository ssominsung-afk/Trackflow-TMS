'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCarrier(formData: {
  name: string
  mc_number?: string
  dot_number?: string
  contact?: string
  phone?: string
  email?: string
  insurance_exp?: string
  is_active?: boolean
}) {
  const supabase = await createClient()
  
  // 1. Get current user's company_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('company_id')
    .eq('id', user.id)
    .single()

  // 2. Insert carrier
  const { data, error } = await supabase
    .from('carriers')
    .insert([{
      ...formData,
      company_id: profile?.company_id
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding carrier:', error)
    throw new Error(error.message)
  }

  // 3. Revalidate the carriers page
  revalidatePath('/carriers')
  
  return data
}
