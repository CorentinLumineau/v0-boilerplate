import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { betterFetch } from '@better-fetch/fetch'
import { getBackendUrl } from '@boilerplate/config/project.config'
import type { AuthSession, LoginCredentials, SignupCredentials } from '@boilerplate/types'

// Query Keys
export const authQueryKeys = {
  all: ['auth'] as const,
  session: () => [...authQueryKeys.all, 'session'] as const,
}

// Queries
export function useSession() {
  return useQuery({
    queryKey: authQueryKeys.session(),
    queryFn: async (): Promise<AuthSession | null> => {
      try {
        const { data } = await betterFetch('/api/auth/get-session', {
          baseURL: getBackendUrl(), 
          credentials: 'include',
        })
        return data as AuthSession || null
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
      const { data, error } = await betterFetch('/api/auth/sign-in', {
        method: 'POST',
        baseURL: getBackendUrl(),
        credentials: 'include',
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      })
      
      if (error) {
        throw new Error(error.message || 'Login failed')
      }
      
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch session
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
    },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const { data, error } = await betterFetch('/api/auth/sign-up', {
        method: 'POST',
        baseURL: getBackendUrl(),
        credentials: 'include',
        body: {
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        },
      })
      
      if (error) {
        throw new Error(error.message || 'Signup failed')
      }
      
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch session
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session() })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await betterFetch('/api/auth/sign-out', {
        method: 'POST',
        baseURL: getBackendUrl(),
        credentials: 'include',
      })
      
      if (error) {
        throw new Error(error.message || 'Logout failed')
      }
    },
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.removeQueries({ queryKey: authQueryKeys.all })
      queryClient.clear() // Clear all cache to avoid stale data
    },
  })
}