import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, handleApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { AuthSession, LoginCredentials, SignupCredentials } from '@boilerplate/types'

// Queries
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async (): Promise<AuthSession | null> => {
      try {
        const response = await apiClient.get<AuthSession>('/auth/get-session')
        return response.data || null
      } catch (error) {
        // If session fetch fails, user is not authenticated
        return null
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry session checks
  })
}

// Mutations
export function useLogin() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await apiClient.post('/auth/sign-in', {
          email: credentials.email,
          password: credentials.password,
        })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch session
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
    },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      try {
        const response = await apiClient.post('/auth/sign-up', {
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      // Invalidate and refetch session
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await apiClient.post('/auth/sign-out')
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: queryKeys.auth.all() })
      queryClient.clear() // Clear all cache to avoid stale data
    },
  })
}