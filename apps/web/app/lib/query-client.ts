import { QueryClient } from '@tanstack/react-query'
import { defaultQueryErrorHandler } from '@/lib/query-error-handler'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes (previously cacheTime)
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (except 408, 429)
          if (error instanceof Response) {
            if (error.status >= 400 && error.status < 500 && 
                error.status !== 408 && error.status !== 429) {
              return false
            }
          }
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error) => {
          // Don't retry mutations on 4xx errors
          if (error instanceof Response && error.status >= 400 && error.status < 500) {
            return false
          }
          return failureCount < 2
        },
      },
    },
  })
}

let clientQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return createQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    if (!clientQueryClient) clientQueryClient = createQueryClient()
    return clientQueryClient
  }
}