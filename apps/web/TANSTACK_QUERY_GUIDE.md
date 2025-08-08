# TanStack Query Architecture Guide

This guide explains the structured approach to API calls using TanStack Query in our Next.js application.

## 🏗️ Architecture Overview

### Core Components

1. **API Client** (`/lib/api-client.ts`)
   - Centralized HTTP client with automatic retry logic
   - Built-in error handling and logging
   - Type-safe responses with `ApiResponse<T>` interface
   - Timeout and abort signal support

2. **Query Keys Factory** (`/lib/query-keys.ts`)
   - Centralized query key management
   - Type-safe query key patterns
   - Consistent invalidation helpers

3. **Query Hooks** (`/lib/queries/`)
   - Feature-specific query and mutation hooks
   - Proper cache management and optimistic updates
   - Error handling and retry logic

4. **Advanced Patterns** (`/lib/queries/patterns.ts`)
   - Reusable patterns for complex scenarios
   - Pagination, infinite queries, optimistic updates
   - Real-time sync and bulk operations

## 🚀 Quick Start

### Basic Query

```typescript
// /lib/queries/users.ts
import { useQuery } from '@tanstack/react-query'
import { apiClient, handleApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      try {
        const response = await apiClient.get<User>(`/users/${userId}`)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!userId,
  })
}
```

### Basic Mutation

```typescript
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData: Partial<User>) => {
      try {
        const response = await apiClient.patch<User>('/users/me', userData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (updatedUser) => {
      // Update user cache
      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        updatedUser
      )
      
      // Invalidate user lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      })
    },
  })
}
```

## 📁 File Structure

```
app/lib/
├── api-client.ts           # Centralized HTTP client
├── query-keys.ts          # Query key factory
├── query-client.ts        # Query client configuration
└── queries/
    ├── auth.ts            # Authentication queries
    ├── notifications.ts   # Notification queries
    ├── preferences.ts     # User preferences queries
    ├── patterns.ts        # Advanced patterns and utilities
    └── [feature].ts       # Feature-specific queries
```

## 🔧 API Client Features

### Automatic Error Handling
```typescript
try {
  const response = await apiClient.get<User>('/users/me')
  return response.data
} catch (error) {
  handleApiError(error) // Throws ApiClientError with proper typing
}
```

### Retry Logic
```typescript
// Automatic retries for server errors (5xx)
// No retries for client errors (4xx) except 408, 429
// Exponential backoff between retries
```

### Request Timeout
```typescript
// Default timeout from TIMING.API_TIMEOUT
// Per-request timeout override
const response = await apiClient.get('/data', { timeout: 30000 })
```

## 🗝️ Query Keys Best Practices

### Hierarchical Structure
```typescript
// ✅ Good: Hierarchical and predictable
queryKeys.users.detail(userId)     // ['users', 'detail', userId]
queryKeys.users.list({ active: true }) // ['users', 'list', { active: true }]

// ❌ Bad: Flat and unpredictable  
['user', userId]
['activeUsers']
```

### Invalidation Patterns
```typescript
// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: queryKeys.users.all() })

// Invalidate only user lists
queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() })

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) })
```

## 🎯 Advanced Patterns

### Optimistic Updates
```typescript
const updateUser = useOptimisticUpdate(
  queryKeys.users.detail(userId),
  (userData) => apiClient.patch('/users/me', userData),
  {
    updateFn: (oldUser, variables) => ({ ...oldUser, ...variables }),
    onError: (error, variables, context) => {
      toast.error('Failed to update user')
    }
  }
)
```

### Pagination
```typescript
const { data, isLoading, error } = usePaginatedQuery(
  queryKeys.users.lists(),
  '/users',
  { page: 1, limit: 20, sort: 'name', order: 'asc' }
)
```

### Dependent Queries
```typescript
const { firstQuery, secondQuery, isLoading } = useDependentQueries(
  queryKeys.users.detail(userId),
  () => apiClient.get(`/users/${userId}`),
  (user) => queryKeys.users.profile(user.id),
  (user) => apiClient.get(`/users/${user.id}/profile`)
)
```

### Bulk Operations
```typescript
const bulkDelete = useBulkOperation(
  '/users/bulk-delete',
  [queryKeys.users.lists(), queryKeys.users.all()],
  {
    operation: 'delete',
    optimisticUpdate: (queryClient, userIds) => {
      // Remove users from cache optimistically
    },
    rollback: (queryClient, userIds) => {
      // Restore users if operation fails
    }
  }
)
```

## 🔄 Migration from Raw Fetch

### Before (Raw Fetch)
```typescript
// ❌ Old approach
const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const data = await response.json()
      setUser(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  fetchUser()
}, [])
```

### After (TanStack Query)
```typescript
// ✅ New approach
const { data: user, isLoading, error } = useQuery({
  queryKey: queryKeys.users.detail('me'),
  queryFn: async () => {
    try {
      const response = await apiClient.get<User>('/users/me')
      return response.data
    } catch (error) {
      handleApiError(error)
    }
  }
})
```

## 🛡️ Error Handling

### API Client Error Types
```typescript
try {
  const response = await apiClient.get('/users/me')
} catch (error) {
  if (error instanceof ApiClientError) {
    switch (error.status) {
      case 401:
        // Handle authentication
        break
      case 403:
        // Handle authorization
        break
      case 404:
        // Handle not found
        break
      default:
        // Handle other errors
    }
  }
}
```

### Query Error Boundaries
```typescript
const { data, error } = useQueryWithErrorBoundary(
  queryKeys.users.detail(userId),
  () => apiClient.get(`/users/${userId}`),
  {
    throwOnError: true, // Will throw to nearest error boundary
    fallbackData: null, // Fallback while loading
  }
)
```

## 📊 Performance Optimizations

### Prefetching
```typescript
const { prefetchOnHover } = usePrefetchPattern()

<Link 
  {...prefetchOnHover(
    queryKeys.users.detail(userId),
    () => apiClient.get(`/users/${userId}`)
  )}
  href={`/users/${userId}`}
>
  View User
</Link>
```

### Background Updates
```typescript
// Keep data fresh with background refetching
useQuery({
  queryKey: queryKeys.notifications.unreadCount(),
  queryFn: () => apiClient.get('/notifications/count'),
  refetchInterval: 30 * 1000, // Refetch every 30 seconds
  refetchIntervalInBackground: true,
})
```

### Selective Invalidation
```typescript
// ✅ Good: Selective invalidation
queryClient.invalidateQueries({ 
  queryKey: queryKeys.users.lists() 
})

// ❌ Bad: Over-invalidation
queryClient.invalidateQueries({ 
  queryKey: queryKeys.users.all() 
})
```

## 🧪 Testing

### Mock API Client
```typescript
// __tests__/setup.ts
import { apiClient } from '@/lib/api-client'

jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}))
```

### Test Query Hooks
```typescript
// __tests__/queries/users.test.ts
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUser } from '@/lib/queries/users'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

test('useUser hook', async () => {
  const mockUser = { id: '1', name: 'John Doe' }
  apiClient.get.mockResolvedValueOnce({ data: mockUser })
  
  const { result, waitFor } = renderHook(
    () => useUser('1'),
    { wrapper: createWrapper() }
  )
  
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toEqual(mockUser)
})
```

## 🎓 Best Practices

### DO ✅
- Use the centralized API client for all HTTP requests
- Follow the query key factory pattern
- Implement proper error handling with `handleApiError`
- Use optimistic updates for better UX
- Prefetch data when appropriate
- Test your query hooks

### DON'T ❌
- Mix raw `fetch` calls with TanStack Query
- Create ad-hoc query keys
- Ignore error handling
- Over-invalidate queries
- Fetch data in `useEffect` hooks
- Skip testing query logic

## 🔗 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Best Practices](https://react-query-v3.tanstack.com/guides/best-practices)
- [Error Handling Guide](https://tanstack.com/query/latest/docs/guides/query-retries)
- [Testing Guide](https://tanstack.com/query/latest/docs/guides/testing)