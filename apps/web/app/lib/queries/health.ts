import { useQuery } from '@tanstack/react-query'
import { apiClient, handleApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

// Health check types
export interface HealthStatus {
  status: 'ok' | 'error'
  message: string
  timestamp: string
  uptime?: number
  version?: string
  environment?: string
  database?: {
    status: 'connected' | 'disconnected'
    latency?: number
  }
}

// Queries
export function useHealthCheck(options?: { 
  enabled?: boolean
  refetchInterval?: number
}) {
  return useQuery({
    queryKey: queryKeys.health.api(),
    queryFn: async (): Promise<HealthStatus> => {
      try {
        const response = await apiClient.get<HealthStatus>('/health')
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    enabled: options?.enabled !== false,
    refetchInterval: options?.refetchInterval ?? false,
    retry: (failureCount, error) => {
      // Don't retry health checks aggressively
      return failureCount < 2
    },
  })
}

// Hook for continuous health monitoring
export function useHealthMonitoring() {
  return useHealthCheck({ 
    refetchInterval: 60 * 1000, // Check every minute
    enabled: true 
  })
}

// Hook for one-time health check
export function useHealthStatus() {
  return useHealthCheck({ 
    enabled: true,
    refetchInterval: undefined 
  })
}