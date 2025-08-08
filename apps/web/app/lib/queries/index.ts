/**
 * Centralized exports for all TanStack Query hooks
 * Import everything you need from a single location
 */

// Authentication queries
export {
  useSession,
  useLogin,
  useSignup,
  useLogout,
} from './auth'

// User management queries  
export {
  useCurrentUser,
  useUser,
  useUsers,
  useUpdateCurrentUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserProfile,
  useChangePassword,
  useUploadAvatar,
  useDeleteAccount,
} from './users'

// Notification queries
export {
  useNotifications,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  addNotificationOptimistically,
} from './notifications'

// Preferences queries
export {
  useUserPreferences,
  useUpdatePreferences,
  useResetPreferences,
  useOptimisticPreferenceUpdate,
} from './preferences'

// Health check queries
export {
  useHealthCheck,
  useHealthMonitoring,
  useHealthStatus,
} from './health'

// Advanced patterns and utilities
export {
  usePaginatedQuery,
  useInfiniteQuery,
  useOptimisticUpdate,
  useDependentQueries,
  useBulkOperation,
  useRealTimeSync,
  usePrefetchPattern,
  useQueryWithErrorBoundary,
} from './patterns'

// Query keys for external use
export { queryKeys } from '../query-keys'

// API client for direct use when needed
export { apiClient, handleApiError, ApiClientError } from '../api-client'

// Type exports
export type {
  ApiResponse,
  ApiError,
} from '../api-client'

// Note: These types would be imported from users.ts when implemented
export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface InfiniteQueryParams {
  limit?: number
  offset?: number
}

// User-related types that would be imported when implemented
export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}

export interface UserProfileUpdate {
  name?: string
  email?: string
  [key: string]: any
}

export interface UserListFilters {
  search?: string
  role?: string
  status?: string
  [key: string]: any
}

export type {
  HealthStatus,
} from './health'