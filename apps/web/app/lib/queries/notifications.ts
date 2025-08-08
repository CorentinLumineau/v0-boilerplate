import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, handleApiError } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Notification } from '@boilerplate/types'

// Queries
export function useNotifications(filters?: { status?: string; type?: string; limit?: number }, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.list(filters || {}),
    queryFn: async (): Promise<Notification[]> => {
      try {
        const searchParams = new URLSearchParams()
        if (filters?.status) searchParams.append('status', filters.status)
        if (filters?.type) searchParams.append('type', filters.type)
        if (filters?.limit) searchParams.append('limit', filters.limit.toString())
        
        const endpoint = `/notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const response = await apiClient.get<{ notifications: Notification[] }>(endpoint)
        return response.data?.notifications || []
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false, // Allow disabling the query
  })
}

export function useUnreadNotificationsCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async (): Promise<number> => {
      try {
        const response = await apiClient.get<{ unreadCount: number }>('/notifications/count')
        return response.data?.unreadCount || 0
      } catch (error) {
        handleApiError(error)
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false, // Allow disabling the query
  })
}

// Mutations
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        const response = await apiClient.patch(`/notifications/${notificationId}`, { status: 'read' })
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (updatedNotification, notificationId) => {
      // Update the specific notification in all relevant queries
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(notification =>
            notification.id === notificationId
              ? { ...notification, status: 'READ' as const, readAt: new Date().toISOString() }
              : notification
          )
        }
      )
      
      // Update unread count
      queryClient.setQueryData(
        queryKeys.notifications.unreadCount(),
        (oldCount: number | undefined) => Math.max(0, (oldCount || 1) - 1)
      )
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await apiClient.patch('/notifications/mark-all-read')
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: () => {
      // Mark all notifications as read in cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData
          return oldData.map(notification => ({
            ...notification,
            status: 'read' as const,
            readAt: notification.readAt || new Date().toISOString()
          }))
        }
      )
      
      // Reset unread count to 0
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0)
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      try {
        const response = await apiClient.delete(`/notifications/${notificationId}`)
        return response.data
      } catch (error) {
        handleApiError(error)
      }
    },
    onSuccess: (_, notificationId) => {
      // Remove notification from all lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData
          return oldData.filter(notification => notification.id !== notificationId)
        }
      )
      
      // Update unread count if the deleted notification was unread
      queryClient.setQueryData(
        queryKeys.notifications.unreadCount(),
        (oldCount: number | undefined) => {
          // We'd need to know if the deleted notification was unread
          // For now, we'll refetch the count to be safe
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
          return oldCount
        }
      )
    },
  })
}

// Optimistic Updates Helper
export function addNotificationOptimistically(
  queryClient: ReturnType<typeof useQueryClient>,
  notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>
) {
  const tempId = `temp-${Date.now()}`
  const tempNotification: Notification = {
    ...notification,
    id: tempId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // Add to all notification lists
  queryClient.setQueriesData(
    { queryKey: queryKeys.notifications.lists() },
    (oldData: Notification[] | undefined) => {
      if (!oldData) return [tempNotification]
      return [tempNotification, ...oldData]
    }
  )
  
  // Update unread count if it's unread
  if (notification.status === 'UNREAD') {
    queryClient.setQueryData(
      queryKeys.notifications.unreadCount(),
      (oldCount: number | undefined) => (oldCount || 0) + 1
    )
  }
  
  return tempId
}