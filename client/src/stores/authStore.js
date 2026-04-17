import { create } from 'zustand'
import { api } from '../services/api'

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, employee } = response.data
      localStorage.setItem('token', token)
      set({ user: employee, token, isAuthenticated: true })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.msg || 'Login failed' }
    }
  },
  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  },
  fetchUser: async () => {
    try {
      const response = await api.get('/auth/me')
      set({ user: response.data })
    } catch (error) {
      useAuthStore.getState().logout()
    }
  }
}))
