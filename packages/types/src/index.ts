// Shared API types between frontend and backend
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  service: string
}