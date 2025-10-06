import { api } from '@/lib/api'
import axios from 'axios'
import qs from 'query-string'

// --- 0. Get User Sessions (Sidebar-Session History) ---
export const getUserSessions = async () => {
  try {
    const data = await axios.get(`/api/history`)
    return data.data
  } catch (error) {
    console.error('Error fetching user sessions:', error)
    throw new Error('Failed to fetch user sessions')
  }
}

// --- 1. Get Session Messages ---
export const getSessionMessages = async (sessionId: string, userId: string) => {
  const res = await api.get(`/session/${sessionId}`, {
    headers: { 'user-id': userId },
  })
  return res.data
}

// --- 2. Get Session List Details ---
export const getSessionListDetails = async (listId: string, sessionId: string, userId: string) => {
  const res = await api.get(`/session-lists/${listId}`, {
    headers: { 'session-id': sessionId, 'user-id': userId },
  })
  return res.data
}

// --- 3. Get Session Profile Details ---
export const getSessionProfileDetails = async (
  profileId: string,
  sessionId: string,
  userId: string
) => {
  const res = await api.get(`/session-profiles/${profileId}`, {
    headers: { 'session-id': sessionId, 'user-id': userId },
  })
  return res.data
}

// --- 4. Delete Session List Items ---
export const deleteSessionListItems = async (
  listId: string,
  sessionId: string,
  userId: string,
  data: { webset_item_ids: string[] }
) => {
  const res = await api.delete(`/session-lists/${listId}/items`, {
    headers: { 'session-id': sessionId, 'user-id': userId },
    data,
  })
  return res.data
}
