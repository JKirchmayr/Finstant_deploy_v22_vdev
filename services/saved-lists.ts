import { api } from '@/lib/api'

// Create a new user list
export type UserListPayload = {
  list_name: string
  list_type: string
  webset_item_ids: string[]
}

export const createUserList = async (userId: string, data: UserListPayload) => {
  const res = await api.post(`/user-lists`, data, {
    headers: { 'user-id': userId },
  })
  return res.data
}

// Add items to an existing list
export const addItemsToUserList = async (userId: string, listId: string, data: string[]) => {
  const res = await api.post(`/user_lists/${listId}/items`, data, {
    headers: { 'user-id': userId },
  })
  return res.data
}

// Remove specific items from a list
export const removeItemsFromUserList = async (userId: string, listId: string, data: any) => {
  const res = await api.delete(`/user_lists/${listId}/items`, {
    headers: { 'user-id': userId },
    data,
  })
  return res.data
}

// Retrieve all lists for a user
export const getUserLists = async (userId: string, limit?: number) => {
  const res = await api.get(`/user-lists`, {
    headers: { 'user-id': userId },
    params: { limit },
  })
  return res.data
}

// Retrieve all items in a specific user list
export const getUserListItems = async (userId: string, listId: string) => {
  const res = await api.get(`/user_lists/${listId}/items`, {
    headers: { 'user-id': userId },
  })
  return res.data
}

// Update user list (delete, archive, reactivate)
export type UpdateUserListAction = 'delete' | 'archive' | 'reactivate'

export const updateUserList = async (
  userId: string,
  listId: string,
  action: UpdateUserListAction
) => {
  const res = await api.patch(
    `/user_lists/${listId}`,
    { action },
    {
      headers: { 'user-id': userId },
    }
  )
  return res.data
}
