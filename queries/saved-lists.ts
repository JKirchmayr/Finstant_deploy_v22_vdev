// src/hooks/useUserList.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createUserList,
  addItemsToUserList,
  removeItemsFromUserList,
  getUserLists,
  getUserListItems,
  updateUserList,
  UpdateUserListAction,
} from '@/services/saved-lists'

// --- Get all user lists ---
export const useUserLists = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: ['userLists', userId],
    queryFn: () => getUserLists(userId, limit),
    enabled: !!userId,
  })
}

// --- Get specific list items ---
export const useUserListItems = (userId: string, listId: string) => {
  return useQuery({
    queryKey: ['userListItems', listId],
    queryFn: () => getUserListItems(userId, listId),
    enabled: !!userId && !!listId,
  })
}

// --- Create list ---
export const useCreateUserList = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => createUserList(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userLists'] }),
  })
}

// --- Add items ---
export const useAddItemsToList = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, listId, data }: { userId: string; listId: string; data: any }) =>
      addItemsToUserList(userId, listId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userListItems', variables.listId] })
    },
  })
}

// --- Remove items ---
export const useRemoveItemsFromList = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, listId, data }: { userId: string; listId: string; data: any }) =>
      removeItemsFromUserList(userId, listId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userListItems', variables.listId] })
    },
  })
}

// --- Update list (delete/archive/reactivate) ---
export const useUpdateUserList = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      listId,
      action,
    }: {
      userId: string
      listId: string
      action: UpdateUserListAction
    }) => updateUserList(userId, listId, action),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] })
      queryClient.invalidateQueries({ queryKey: ['userListItems', variables.listId] })
    },
  })
}
