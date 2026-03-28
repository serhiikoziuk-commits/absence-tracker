'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const jobTitle = formData.get('job_title') as string | null
  const dateOfBirth = formData.get('date_of_birth') as string | null

  const { error } = await supabase
    .from('users')
    .update({
      first_name: firstName,
      last_name: lastName || null,
      job_title: jobTitle || null,
      date_of_birth: dateOfBirth || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/[workspace]/profile', 'page')
  return { success: true }
}

export async function updatePushNotifications(enabled: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase
    .from('users')
    .update({ push_notifications_enabled: enabled })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
