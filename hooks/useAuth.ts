'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { login } from './action'
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { createClient } from '@/lib/supabase/client'

// Types for authentication inputs
interface AuthCredentials {
  email: string
  password: string
}

// Hook for logging in a user
export const useLoginUser = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async ({ email, password }: AuthCredentials) => login({ email, password }),
    onSuccess: () => {
      toast.success('Logged in successfully!')
      router.replace('/copilot')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export const useAuth = () => {
  const user = useAuthStore(s => s.user)
  const setUser = useAuthStore(s => s.setUser)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!user) {
        const supabase = await createClient()
        setLoading(true)
        const { data, error } = await supabase.auth.getUser()
        if (data?.user) {
          const { data: user, error: err } = await supabase
            .from('users')
            .select()
            .eq('email', data.user.email ?? '')

          setUser({ user_id: user?.[0].id, ...data.user })
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    }

    init()
  }, [user, setUser])

  return { user, loading }
}
