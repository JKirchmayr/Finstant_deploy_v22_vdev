// src/hooks/useSession.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserSessions,
  getSessionMessages,
  getSessionListDetails,
  getSessionProfileDetails,
  deleteSessionListItems,
  stopWebset,
} from '@/services/sessions'

export const useGetUserSessionsQuery = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getUserSessions,
    staleTime: 5 * 60 * 1000,
  })
}

// --- Get Session Messages ---
export const useSessionMessages = (
  sessionId: string,
  userId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['sessionMessages', sessionId],
    queryFn: () => getSessionMessages(sessionId, userId),
    enabled: !!sessionId && !!userId && (options?.enabled ?? true),
    staleTime: Infinity,
  })
}

// --- Get Session List Details ---
export const useSessionListDetails = (
  listId: string,
  sessionId: string,
  userId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['sessionListDetails', listId],
    queryFn: () => getSessionListDetails(listId, sessionId, userId),
    enabled: !!listId && !!sessionId && !!userId && (options?.enabled ?? true),
  })
}

// --- Get Session Profile Details ---
export const useSessionProfileDetails = (
  profileId: string,
  sessionId: string,
  userId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ['sessionProfileDetails', profileId],
    queryFn: () => getSessionProfileDetails(profileId, sessionId, userId),
    enabled: !!profileId && !!sessionId && !!userId && (options?.enabled ?? true),
  })
}

// --- Delete Session List Items ---
export const useDeleteSessionListItems = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      listId,
      sessionId,
      userId,
      data,
    }: {
      listId: string
      sessionId: string
      userId: string
      data: { webset_item_ids: string[] }
    }) => deleteSessionListItems(listId, sessionId, userId, data),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['sessionListDetails', variables.listId],
      })
    },
  })
}

export const useStopWebset = () => {
  return useMutation({
    mutationFn: ({
      sessionId,
      userId,
      webset_id,
    }: {
      sessionId: string
      userId: string
      webset_id: string
    }) => stopWebset(sessionId, userId, webset_id),
  })
}
