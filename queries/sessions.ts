import { useQuery } from '@tanstack/react-query'
import { getUserSessions } from '@/services/sessions'

export const useGetUserSessionsQuery = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getUserSessions,
  })
}
