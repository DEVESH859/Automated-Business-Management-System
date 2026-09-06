import axios from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '')
const baseURL = configuredApiUrl ? `${configuredApiUrl}/api` : '/api'

const getApiErrorMessage = (error, fallback) => {
  if (!error.response) {
    return 'Cannot reach the server. Please try again in a moment.'
  }
  return error.response.data?.msg || error.response.data?.error || fallback
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers['x-auth-token'] = token
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount).replace('₹', 'Rs. ')
}

export { getApiErrorMessage }

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
