import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, handleApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { User } from '@boilerplate/types'
import { logger } from '@/lib/utils/logger'

// User profile queries
export function useCurrentUser(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.detail('me'),
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await apiClient.get<User>('/users/me')
        return response.data
      } catch (error) {
        // Handle 401 gracefully - user not authenticated
        if (error instanceof Error && error.message.includes('401')) {
          return null
        }
        handleApiError(error)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: options?.enabled !== false,
  })
}

export function useUser(userId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async (): Promise<User> => {
      try {
        const response = await apiClient.get<User>(`/users/${userId}`)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: !!userId && options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// User list queries (for future admin features)
export interface UserListFilters {
  search?: string
  role?: string
  status?: 'active' | 'inactive'
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export function useUsers(
  filters: UserListFilters = {},
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: async (): Promise<{
      users: User[]
      pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
      }
    }> => {
      try {
        const searchParams = new URLSearchParams()
        
        if (filters.search) searchParams.append('search', filters.search)
        if (filters.role) searchParams.append('role', filters.role)
        if (filters.status) searchParams.append('status', filters.status)
        if (filters.page) searchParams.append('page', filters.page.toString())
        if (filters.limit) searchParams.append('limit', filters.limit.toString())
        if (filters.sort) searchParams.append('sort', filters.sort)
        if (filters.order) searchParams.append('order', filters.order)
        
        const endpoint = `/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const response = await apiClient.get<{
          users: User[]
          pagination: {
            total: number
            page: number
            limit: number
            totalPages: number
          }
        }>(endpoint)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    enabled: options?.enabled !== false,
    staleTime: 60 * 1000, // 1 minute
  })
}

// User mutations
export function useUpdateCurrentUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userData: Partial<User>): Promise<User> => {
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
        queryKeys.users.detail('me'),
        updatedUser
      )
      
      // Update specific user cache if we have the ID
      if (updatedUser.id) {
        queryClient.setQueryData(
          queryKeys.users.detail(updatedUser.id),
          updatedUser
        )
      }
      
      // Invalidate user lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      })
      
      logger.userInfo('User profile updated successfully', {
        userId: updatedUser.id
      })
    },
    onError: (error) => {
      logger.userError('Failed to update user profile', {
        error: error instanceof Error ? error.message : String(error)
      }, error instanceof Error ? error : undefined)
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, userData }: {
      userId: string
      userData: Partial<User>
    }): Promise<User> => {
      try {
        const response = await apiClient.patch<User>(`/users/${userId}`, userData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (updatedUser) => {
      // Update specific user cache
      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        updatedUser
      )
      
      // Invalidate user lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      })
      
      logger.userInfo('User updated successfully', {
        userId: updatedUser.id
      })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      try {
        await apiClient.delete(`/users/${userId}`)
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(userId),
      })
      
      // Invalidate user lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.lists(),
      })
      
      logger.userInfo('User deleted successfully', { userId })
    },
  })
}

// User profile management
export interface UserProfileUpdate {
  name?: string
  email?: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileData: UserProfileUpdate): Promise<User> => {
      try {
        const response = await apiClient.patch<User>('/users/me/profile', profileData)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (updatedUser) => {
      // Update user caches
      queryClient.setQueryData(queryKeys.users.detail('me'), updatedUser)
      
      if (updatedUser.id) {
        queryClient.setQueryData(
          queryKeys.users.detail(updatedUser.id),
          updatedUser
        )
        
        // Update user profile cache
        queryClient.setQueryData(
          queryKeys.users.profile(updatedUser.id),
          updatedUser
        )
      }
      
      logger.userInfo('User profile updated successfully')
    },
  })
}

// Password management
export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwordData: PasswordChangeData): Promise<void> => {
      try {
        await apiClient.patch('/users/me/password', passwordData)
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      logger.userInfo('Password changed successfully')
    },
    onError: (error) => {
      logger.userError('Failed to change password', {
        error: error instanceof Error ? error.message : String(error)
      }, error instanceof Error ? error : undefined)
    },
  })
}

// Avatar upload
export function useUploadAvatar() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (file: File): Promise<{ avatarUrl: string }> => {
      try {
        const formData = new FormData()
        formData.append('avatar', file)
        
        const response = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: ({ avatarUrl }) => {
      // Update current user with new avatar
      queryClient.setQueryData(
        queryKeys.users.detail('me'),
        (oldUser: User | undefined) => {
          if (!oldUser) return oldUser
          return { ...oldUser, avatar: avatarUrl }
        }
      )
      
      logger.userInfo('Avatar uploaded successfully', { avatarUrl })
    },
  })
}

// Account deletion
export function useDeleteAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (password: string): Promise<void> => {
      try {
        await apiClient.delete('/users/me')
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      // Clear all user-related cache
      queryClient.removeQueries({ queryKey: queryKeys.users.all() })
      queryClient.removeQueries({ queryKey: queryKeys.auth.all() })
      queryClient.removeQueries({ queryKey: queryKeys.preferences.all() })
      
      logger.userInfo('Account deleted successfully')
    },
  })
}