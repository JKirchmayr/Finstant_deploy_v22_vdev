import axios from 'axios'
import qs from 'query-string'

export const getUserSessions = async () => {
  try {
    const data = await axios.get(`/api/history`)
    return data.data
  } catch (error) {
    console.error('Error fetching user sessions:', error)
    throw new Error('Failed to fetch user sessions')
  }
}
