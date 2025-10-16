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
  UserListPayload,
  updateItemPosition,
  updateUserListBulk,
} from '@/services/saved-lists'
import { toast } from 'sonner'
import { string } from 'zod'

// --- Get all user lists ---
export const useUserLists = (userId: string, type?: string, limit?: number, enabled?: boolean) => {
  return useQuery({
    queryKey: ['userLists', userId, type, limit],
    queryFn: () => getUserLists(userId, type, limit),
    enabled: !!userId && (enabled ?? true),
    staleTime: 1000 * 60 * 60, // 60 minutes
  })
}

// --- Get specific list items ---
export const useUserListItems = (userId: string, listId: string, enabled?: boolean) => {
  return useQuery({
    queryKey: ['userListItems', listId],
    queryFn: () => getUserListItems(userId, listId),
    enabled: !!userId && !!listId && (enabled ?? true),
  })
}

// --- Create list ---
export const useCreateUserList = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserListPayload }) =>
      createUserList(userId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userLists'] }),
  })
}

// --- Add items ---
export const useAddItemsToList = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      listId,
      webset_item_ids,
    }: {
      userId: string
      listId: string
      webset_item_ids: string[]
    }) => addItemsToUserList(userId, listId, webset_item_ids),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userListItems', variables.listId] })
    },
  })
}

// --- Remove items ---
export const useRemoveItemsFromList = (enabled: boolean) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, listId, data }: { userId: string; listId: string; data: any }) =>
      removeItemsFromUserList(userId, listId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userListItems', variables.listId] })
      queryClient.invalidateQueries({ queryKey: ['userLists'] })
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

export const useUpdateItemPosition = (listId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string
      payload: { saved_list_item_id: string; new_position: number }
    }) => updateItemPosition(userId, listId, payload),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userListItems', listId] })
    },
    onError: () => {
      toast.error('could not save the new order.Reverting changes.')
    },
  })
}

export const useUpdateUserListsBulk = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      userId,
      action,
      saved_list_ids,
    }: {
      userId: string
      action: UpdateUserListAction
      saved_list_ids: string[]
    }) => updateUserListBulk(userId, action, saved_list_ids),
    onSuccess: () => {
      toast.success('Action completed successfully!')
      queryClient.invalidateQueries({ queryKey: ['userLists'] })
    },
    onError: error => {
      toast.error('Failed to update lists.Please try again.')
      console.error(`Error performing bulk action:`, error)
    },
  })
}
