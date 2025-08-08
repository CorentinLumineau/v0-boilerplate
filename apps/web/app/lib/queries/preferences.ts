import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, handleApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { mutationSuccessHandler, mutationErrorHandler } from '@/lib/query-error-handler'
import type { UserPreferences } from '@boilerplate/types'
import { logger } from '@/lib/utils/logger'

// Queries
export function useUserPreferences(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.preferences.user(),
    queryFn: async (): Promise<UserPreferences | null> => {
      try {
        const response = await apiClient.get<UserPreferences>('/preferences')
        return response.data || null
      } catch (error) {
        // Handle 401 gracefully - user not authenticated
        if (error instanceof Error && error.message.includes('401')) {
          logger.preferencesInfo('User not authenticated - returning null preferences')
          return null
        }
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry preference fetches
    enabled: options?.enabled !== false,
  })
}

// Mutations
export function useUpdatePreferences() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
      try {
        logger.preferencesDebug('Sending preferences update to API', { preferences })
        const response = await apiClient.patch<UserPreferences>('/preferences', { preferences })
        logger.preferencesDebug('Received API response', { response: response.data })
        return response.data
      } catch (error) {
        logger.preferencesError('API call failed', { 
          error: error instanceof Error ? error.message : String(error),
          preferences 
        }, error instanceof Error ? error : undefined)
        handleApiError(error)
      }
    },
    onSuccess: (updatedPreferences) => {
      logger.preferencesDebug('Preferences update successful, updating cache', { updatedPreferences })
      
      // Update the preferences cache
      queryClient.setQueryData(
        queryKeys.preferences.user(),
        updatedPreferences
      )
      
      // Invalidate related caches to ensure consistency
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.all(),
      })
      
      mutationSuccessHandler(updatedPreferences, 'update preferences', {
        context: { preferences: updatedPreferences }
      })
    },
    onError: (error) => {
      mutationErrorHandler(error, 'update preferences')
    },
  })
}

export function useResetPreferences() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (): Promise<UserPreferences> => {
      try {
        const response = await apiClient.delete<UserPreferences>('/preferences')
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (resetPreferences) => {
      // Update the preferences cache with reset values
      queryClient.setQueryData(
        queryKeys.preferences.user(),
        resetPreferences
      )
      
      // Invalidate all preference-related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.preferences.all(),
      })
      
      mutationSuccessHandler(resetPreferences, 'reset preferences', {
        context: { preferences: resetPreferences }
      })
    },
    onError: (error) => {
      mutationErrorHandler(error, 'reset preferences')
    },
  })
}

// Optimistic update helper
export function useOptimisticPreferenceUpdate() {
  const queryClient = useQueryClient()
  
  const updatePreferences = useMutation({
    mutationFn: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
      try {
        const response = await apiClient.patch<UserPreferences>('/preferences', { preferences })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onMutate: async (newPreferences) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.preferences.user() })
      
      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData<UserPreferences>(
        queryKeys.preferences.user()
      )
      
      // Optimistically update to the new value
      if (previousPreferences) {
        queryClient.setQueryData(
          queryKeys.preferences.user(),
          { ...previousPreferences, ...newPreferences }
        )
      }
      
      // Return a context with the previous value
      return { previousPreferences }
    },
    onError: (error, newPreferences, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousPreferences) {
        queryClient.setQueryData(
          queryKeys.preferences.user(),
          context.previousPreferences
        )
      }
      
      logger.preferencesError('Optimistic preference update failed - rolling back', {
        error: error instanceof Error ? error.message : String(error),
        attemptedPreferences: newPreferences
      }, error instanceof Error ? error : undefined)
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.preferences.user() })
    },
  })
  
  return updatePreferences
}