'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getUserProfile() {
  const supabase = await createClient()
  const user = await supabase.auth.getUser()
  const u = user.data.user
  if (!u) return redirect('/login')
  const { data, error } = await supabase.from('users').select('*').eq('auth_user_id', u.id).single()
  if (error || !data) {
    throw new Error('User not found')
  }
  return data
}
