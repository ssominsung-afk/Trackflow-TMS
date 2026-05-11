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
  try {
    const supabase = await createClient()
    
    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'User not authenticated' }
    }

    // 2. Get company_id with fallback
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      return { success: false, error: 'Failed to fetch user profile' }
    }

    // 3. Prepare data (convert empty strings to null for DB)
    const insertData = {
      name: formData.name,
      mc_number: formData.mc_number || null,
      dot_number: formData.dot_number || null,
      contact: formData.contact || null,
      phone: formData.phone || null,
      email: formData.email || null,
      insurance_exp: formData.insurance_exp || null,
      is_active: formData.is_active ?? true,
      company_id: profile?.company_id || user.user_metadata?.company_id || null
    }

    // 4. Insert carrier
    const { data, error: insertError } = await supabase
      .from('carriers')
      .insert([insertData])
      .select()
      .single()

    if (insertError) {
      console.error('Insert Error:', insertError)
      return { success: false, error: insertError.message }
    }

    // 5. Revalidate
    revalidatePath('/carriers')
    
    return { success: true, data }
  } catch (err: any) {
    console.error('Server Action Crash:', err)
    return { success: false, error: 'Internal server error' }
  }
}
