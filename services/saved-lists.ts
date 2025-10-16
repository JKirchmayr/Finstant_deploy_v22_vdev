import { api } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/utils'

export type UserListPayload = {
  list_name: string
  list_type: string
  webset_item_ids: string[]
}

export type UpdateUserListAction = 'delete' | 'archive' | 'reactivate'

// Create a new user list
export const createUserList = async (
  userId: string,
  data: UserListPayload,
  type?: 'session' | 'manual'
) => {
  try {
    const res = await api.post(`/user-lists`, data, {
      headers: { 'user-id': userId },
    })
    return res.data
  } catch (error) {
    console.log(getApiErrorMessage(error))
    throw new Error('Failed to fetch user sessions')
  }
}

// Add items to an existing list
export const addItemsToUserList = async (
  userId: string,
  listId: string,
  webset_item_ids: string[]
) => {
  try {
    const res = await api.post(
      `/user-lists/${listId}/items`,
      { webset_item_ids },
      { headers: { 'user-id': userId } }
    )
    return res.data
  } catch (error) {
    console.log(getApiErrorMessage(error))
    throw new Error('Failed to fetch user sessions')
  }
}

// Remove specific items from a list
export const removeItemsFromUserList = async (userId: string, listId: string, data: any) => {
  try {
    const res = await api.delete(`/user-lists/${listId}/items`, {
      headers: { 'user-id': userId },
      data,
    })
    return res.data
  } catch (error) {
    console.log(getApiErrorMessage(error))
    throw new Error('Failed to fetch user sessions')
  }
}

// Retrieve all lists for a user

export const getUserLists = async (userId: string, type?: string, limit?: number) => {
  try {
    const params: { type?: string; limit?: number } = {}
    if (type && type !== 'all') {
      params.type = type
    }
    if (limit) {
      params.limit = limit
    }
    const res = await api.get(`/user-lists`, {
      headers: { 'user-id': userId },
      params,
    })
    return res.data
  } catch (error) {
    console.log(getApiErrorMessage(error))
    throw new Error('Failed to fetch user sessions')
  }
}

// Retrieve all items in a specific user list

export const getUserListItems = async (userId: string, listId: string) => {
  try {
    const res = await api.get(`/user-lists/${listId}`, {
      headers: { 'user-id': userId },
    })
    return res.data
  } catch (error) {
    console.log(getApiErrorMessage(error))
    throw new Error('Failed to fetch user sessions')
  }
}

// Update user list (delete, archive, reactivate)

export const updateUserList = async (
  userId: string,
  listId: string,
  action: UpdateUserListAction
) => {
  try {
    const res = await api.patch(
      `/user-lists/${listId}`,
      { action },
      {
        headers: { 'user-id': userId },
      }
    )
    return res.data
  } catch (error) {
    console.log(getApiErrorMessage(error))
    throw new Error('Failed to update user list')
  }
}

export const updateUserListBulk = async (
  userId: string,
  action: UpdateUserListAction,
  saved_list_ids: string[]
) => {
  try {
    const res = await api.patch(
      `/user-lists`,
      { action, saved_list_ids },
      {
        headers: { 'user-id': userId },
      }
    )
    return res.data
  } catch (error) {
    console.log(getApiErrorMessage(error))
    throw new Error('Failed to perform bulk update on user lists')
  }
}

export const updateItemPosition = async (
  userId: string,
  listId: string,
  payload: { saved_list_item_id: string; new_position: number }
) => {
  try {
    const res = await api.patch(`/user-lists/${listId}/items/position`, payload, {
      headers: { 'user-id': userId },
    })
    return res.data
  } catch (error) {
    console.error('Failed to update item position:', getApiErrorMessage(error))
    throw new Error('Failed to update item position')
  }
}
