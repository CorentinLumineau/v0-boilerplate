import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Notification } from '@boilerplate/types'

// Query Keys
export const notificationQueryKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...notificationQueryKeys.lists(), filters] as const,
  details: () => [...notificationQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationQueryKeys.details(), id] as const,
  unreadCount: () => [...notificationQueryKeys.all, 'unreadCount'] as const,
}

// Queries
export function useNotifications(filters?: { status?: string; type?: string; limit?: number }) {
  return useQuery({
    queryKey: notificationQueryKeys.list(filters || {}),
    queryFn: async (): Promise<Notification[]> => {
      const searchParams = new URLSearchParams()
      if (filters?.status) searchParams.append('status', filters.status)
      if (filters?.type) searchParams.append('type', filters.type)
      if (filters?.limit) searchParams.append('limit', filters.limit.toString())
      
      const url = `/api/notifications${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.notifications || []
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: async (): Promise<number> => {
      const response = await fetch(`/api/notifications/count`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notification count: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.unreadCount || 0
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Mutations
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'read' }),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: (updatedNotification, notificationId) => {
      // Update the specific notification in all relevant queries
      queryClient.setQueriesData(
        { queryKey: notificationQueryKeys.lists() },
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
        notificationQueryKeys.unreadCount(),
        (oldCount: number | undefined) => Math.max(0, (oldCount || 1) - 1)
      )
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      // Mark all notifications as read in cache
      queryClient.setQueriesData(
        { queryKey: notificationQueryKeys.lists() },
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
      queryClient.setQueryData(notificationQueryKeys.unreadCount(), 0)
    },
  })
}

export function useDeleteNotification() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.statusText}`)
      }
      
      return response.json()
    },
    onSuccess: (_, notificationId) => {
      // Remove notification from all lists
      queryClient.setQueriesData(
        { queryKey: notificationQueryKeys.lists() },
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData
          return oldData.filter(notification => notification.id !== notificationId)
        }
      )
      
      // Update unread count if the deleted notification was unread
      queryClient.setQueryData(
        notificationQueryKeys.unreadCount(),
        (oldCount: number | undefined) => {
          // We'd need to know if the deleted notification was unread
          // For now, we'll refetch the count to be safe
          queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() })
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
    { queryKey: notificationQueryKeys.lists() },
    (oldData: Notification[] | undefined) => {
      if (!oldData) return [tempNotification]
      return [tempNotification, ...oldData]
    }
  )
  
  // Update unread count if it's unread
  if (notification.status === 'UNREAD') {
    queryClient.setQueryData(
      notificationQueryKeys.unreadCount(),
      (oldCount: number | undefined) => (oldCount || 0) + 1
    )
  }
  
  return tempId
}