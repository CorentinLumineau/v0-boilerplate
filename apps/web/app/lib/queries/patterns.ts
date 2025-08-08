/**
 * Advanced TanStack Query patterns and utilities for future development
 * This file demonstrates best practices and reusable patterns
 */

import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'
import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { logger } from '@/lib/utils/logger'

// =============================================================================
// PAGINATION PATTERNS
// =============================================================================

export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Generic paginated query hook
 */
export function usePaginatedQuery<T>(
  baseQueryKey: readonly string[],
  endpoint: string,
  params: PaginationParams = {},
  options?: {
    enabled?: boolean
    keepPreviousData?: boolean
  }
) {
  const queryKey = [...baseQueryKey, 'paginated', params]
  
  return useQuery({
    queryKey,
    queryFn: async (): Promise<PaginatedResponse<T>> => {
      try {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.sort) searchParams.append('sort', params.sort)
        if (params.order) searchParams.append('order', params.order)
        
        const fullEndpoint = `${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const response = await apiClient.get<PaginatedResponse<T>>(fullEndpoint)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    placeholderData: options?.keepPreviousData ? (previousData) => previousData : undefined,
    enabled: options?.enabled !== false,
  })
}

// =============================================================================
// INFINITE QUERY PATTERNS
// =============================================================================

export interface InfiniteQueryParams {
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

/**
 * Generic infinite query hook for cursor-based pagination
 */
export function useInfiniteQuery<T>(
  baseQueryKey: readonly string[],
  endpoint: string,
  params: InfiniteQueryParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [...baseQueryKey, 'infinite', params],
    queryFn: async ({ pageParam = '' }): Promise<{
      data: T[]
      nextCursor?: string
      hasNextPage: boolean
    }> => {
      try {
        const searchParams = new URLSearchParams()
        if (pageParam) searchParams.append('cursor', String(pageParam))
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.sort) searchParams.append('sort', params.sort)
        if (params.order) searchParams.append('order', params.order)
        
        const fullEndpoint = `${endpoint}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const response = await apiClient.get<{
          data: T[]
          nextCursor?: string
          hasNextPage: boolean
        }>(fullEndpoint)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: options?.enabled !== false,
  })
}

// =============================================================================
// OPTIMISTIC UPDATE PATTERNS
// =============================================================================

/**
 * Generic optimistic update hook
 */
export function useOptimisticUpdate<TData, TVariables>(
  queryKey: readonly (string | number | Record<string, any>)[],
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    updateFn: (oldData: TData | undefined, variables: TVariables) => TData | undefined
    onError?: (error: unknown, variables: TVariables, context: { previousData: TData | undefined }) => void
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey })
      
      // Snapshot previous value
      const previousData = queryClient.getQueryData<TData>(queryKey)
      
      // Optimistically update
      const newData = options.updateFn(previousData, variables)
      if (newData !== undefined) {
        queryClient.setQueryData(queryKey, newData)
      }
      
      return { previousData }
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
      
      if (context) {
        options.onError?.(error, variables, context)
      }
      
      logger.apiError('Optimistic update failed - rolling back', {
        error: error instanceof Error ? error.message : String(error),
        queryKey: JSON.stringify(queryKey)
      }, error instanceof Error ? error : undefined)
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

// =============================================================================
// DEPENDENT QUERIES PATTERN
// =============================================================================

/**
 * Hook for dependent queries - second query depends on first query result
 */
export function useDependentQueries<TFirstData, TSecondData>(
  firstQueryKey: readonly (string | number | Record<string, any>)[],
  firstQueryFn: () => Promise<TFirstData>,
  secondQueryKey: (firstData: TFirstData) => readonly (string | number | Record<string, any>)[],
  secondQueryFn: (firstData: TFirstData) => Promise<TSecondData>,
  options?: {
    enabled?: boolean
    firstQueryOptions?: { staleTime?: number }
    secondQueryOptions?: { staleTime?: number }
  }
) {
  const firstQuery = useQuery({
    queryKey: firstQueryKey,
    queryFn: firstQueryFn,
    enabled: options?.enabled !== false,
    staleTime: options?.firstQueryOptions?.staleTime,
  })
  
  const secondQuery = useQuery({
    queryKey: firstQuery.data ? secondQueryKey(firstQuery.data) : ['dependent', 'disabled'],
    queryFn: () => secondQueryFn(firstQuery.data!),
    enabled: !!firstQuery.data && options?.enabled !== false,
    staleTime: options?.secondQueryOptions?.staleTime,
  })
  
  return {
    firstQuery,
    secondQuery,
    isLoading: firstQuery.isLoading || secondQuery.isLoading,
    isError: firstQuery.isError || secondQuery.isError,
    error: firstQuery.error || secondQuery.error,
  }
}

// =============================================================================
// BULK OPERATIONS PATTERN
// =============================================================================

/**
 * Generic bulk operations hook
 */
export function useBulkOperation<TData, TItem>(
  endpoint: string,
  queryKeysToInvalidate: readonly (string | number | Record<string, any>)[][],
  options: {
    operation: 'create' | 'update' | 'delete'
    optimisticUpdate?: (queryClient: QueryClient, items: TItem[]) => void
    rollback?: (queryClient: QueryClient, items: TItem[]) => void
  }
) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (items: TItem[]): Promise<TData[]> => {
      try {
        const method = options.operation === 'create' ? 'post' 
          : options.operation === 'update' ? 'patch' 
          : 'delete'
        
        const response = await apiClient[method]<TData[]>(endpoint, { items })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onMutate: async (items: TItem[]) => {
      // Cancel outgoing refetches
      await Promise.all(
        queryKeysToInvalidate.map(key => 
          queryClient.cancelQueries({ queryKey: key })
        )
      )
      
      // Apply optimistic update if provided
      if (options.optimisticUpdate) {
        options.optimisticUpdate(queryClient, items)
      }
      
      return { items }
    },
    onError: (error, items, context) => {
      // Apply rollback if provided
      if (options.rollback && context?.items) {
        options.rollback(queryClient, context.items)
      }
      
      logger.apiError(`Bulk ${options.operation} operation failed`, {
        error: error instanceof Error ? error.message : String(error),
        itemCount: items.length
      }, error instanceof Error ? error : undefined)
    },
    onSuccess: (data, items) => {
      logger.apiInfo(`Bulk ${options.operation} operation succeeded`, {
        itemCount: items.length,
        resultCount: data.length
      })
    },
    onSettled: () => {
      // Invalidate all relevant query keys
      queryKeysToInvalidate.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })
    },
  })
}

// =============================================================================
// REAL-TIME UPDATES PATTERN
// =============================================================================

/**
 * Hook for real-time data synchronization
 */
export function useRealTimeSync<TData>(
  queryKey: readonly (string | number | Record<string, any>)[],
  websocketUrl: string,
  options?: {
    enabled?: boolean
    onMessage?: (data: TData) => void
    onError?: (error: Event) => void
  }
) {
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: [...queryKey, 'realtime'],
    queryFn: () => {
      return new Promise<WebSocket>((resolve, reject) => {
        try {
          const ws = new WebSocket(websocketUrl)
          
          ws.onopen = () => resolve(ws)
          ws.onerror = (error) => {
            options?.onError?.(error)
            reject(error)
          }
          
          ws.onmessage = (event) => {
            try {
              const data: TData = JSON.parse(event.data)
              
              // Update query cache with real-time data
              queryClient.setQueryData(queryKey, data)
              
              options?.onMessage?.(data)
            } catch (error) {
              logger.apiError('Failed to parse WebSocket message', {
                error: error instanceof Error ? error.message : String(error)
              }, error instanceof Error ? error : undefined)
            }
          }
          
        } catch (error) {
          reject(error)
        }
      })
    },
    enabled: options?.enabled !== false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  })
}

// =============================================================================
// PREFETCHING PATTERNS
// =============================================================================

/**
 * Utility for prefetching related data
 */
export function usePrefetchPattern() {
  const queryClient = useQueryClient()
  
  const prefetchRelatedData = async <T>(
    queryKey: readonly (string | number | Record<string, any>)[],
    queryFn: () => Promise<T>,
    options?: { staleTime?: number }
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    })
  }
  
  const prefetchOnHover = <T>(
    queryKey: readonly (string | number | Record<string, any>)[],
    queryFn: () => Promise<T>
  ) => {
    return {
      onMouseEnter: () => {
        queryClient.prefetchQuery({
          queryKey,
          queryFn,
          staleTime: 30 * 1000, // 30 seconds for hover prefetch
        })
      }
    }
  }
  
  return {
    prefetchRelatedData,
    prefetchOnHover,
  }
}

// =============================================================================
// ERROR BOUNDARY INTEGRATION
// =============================================================================

/**
 * Query with error boundary integration
 */
export function useQueryWithErrorBoundary<T>(
  queryKey: readonly (string | number | Record<string, any>)[],
  queryFn: () => Promise<T>,
  options?: {
    enabled?: boolean
    throwOnError?: boolean
    fallbackData?: T
  }
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled !== false,
    throwOnError: options?.throwOnError ?? false,
    // placeholderData: options?.fallbackData, // Removed due to type complexity
    retry: (failureCount, error) => {
      // Don't retry on client errors
      if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
        return false
      }
      return failureCount < 3
    },
  })
}