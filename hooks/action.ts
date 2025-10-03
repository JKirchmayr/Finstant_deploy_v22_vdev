'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { LoginCredType, SignupCredType } from '@/types/auth'

export async function login({ email, password }: { email: string; password: string }) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    throw new Error(
      error.message.includes('Invalid login credentials')
        ? 'No account found for this email. Please sign up or check your credentials.'
        : error.message
    )
  }

  if (!data.session) {
    throw new Error('Login failed. No session returned.')
  }

  return data.session
}

// export async function signup({ email, password }: SignupCredType) {
//   const supabase = await createClient()

//   const { error, data } = await supabase.auth.signUp({ email, password })

//   if (data?.user) {
//     const { error: userError } = await supabase.from("users").insert([
//       {
//         auth_user_id: data.user.id,
//         email: data.user.email,
//       },
//     ])

//     if (userError) {
//       console.log("User table insert error:", userError)
//       throw new Error(userError.message)
//     }
//   }

//   if (error) {
//     throw new Error(error.message)
//   }

//   return data
// }

// export async function updateUserProfile(profileData: { fname: string; lname: string }) {
//   const supabase = await createClient()
//   const { data: session } = await supabase.auth.getSession()

//   if (!session?.session) {
//     redirect("/login")
//   }

//   const { data: updatedUser, error } = await supabase
//     .from("users")
//     .update(profileData)
//     .eq("auth_user_id", session.session.user.id)
//     .select("*")
//     .single()

//   if (error) {
//     throw new Error("Failed to update profile")
//   }

//   return updatedUser
// }
