import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Prediction API
export const predictionAPI = {
  predict: (vehicleData) =>
    apiClient.post('/predictions/predict', vehicleData),

  getHistory: (limit = 50) =>
    apiClient.get('/predictions/history', { params: { limit } }),

  getStatistics: () =>
    apiClient.get('/predictions/statistics'),

  getPrediction: (id) =>
    apiClient.get(`/predictions/${id}`),

  deletePrediction: (id) =>
    apiClient.delete(`/predictions/${id}`),

  // Diagram endpoints
  getDiagramPreview: (id) =>
    apiClient.get(`/predictions/diagram-preview/${id}`),

  downloadDiagram: (id) =>
    apiClient.get(`/predictions/download-diagram/${id}`, { responseType: 'blob' }),

  getComparisonChart: () =>
    apiClient.get('/predictions/comparison/chart'),

  downloadComparisonChart: () =>
    apiClient.get('/predictions/comparison/download', { responseType: 'blob' }),
}

// Report API
export const reportAPI = {
  downloadPredictionReport: (id) =>
    apiClient.get(`/reports/prediction/${id}`, { responseType: 'blob' }),

  downloadHistoryReport: () =>
    apiClient.get('/reports/history', { responseType: 'blob' }),
}

export default apiClient
