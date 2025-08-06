import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
        const response = await fetch('/api/auth/get-session', {
          credentials: 'include',
        })
        
        if (!response.ok) {
          return null
        }
        
        const data = await response.json()
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
      const response = await fetch('/api/auth/sign-in', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Login failed' }))
        throw new Error(error.message || 'Login failed')
      }
      
      return response.json()
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
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Signup failed' }))
        throw new Error(error.message || 'Signup failed')
      }
      
      return response.json()
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
      const response = await fetch('/api/auth/sign-out', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Logout failed' }))
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