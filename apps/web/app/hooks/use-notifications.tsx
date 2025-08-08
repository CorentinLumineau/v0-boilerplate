'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
// No need to import getBackendUrl for web app - using relative paths
import { 
  useNotifications as useNotificationsQuery,
  useUnreadNotificationsCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  addNotificationOptimistically
} from '@/lib/queries/notifications'
import { queryKeys } from '@/lib/query-keys'
import { useSession } from '@/lib/auth-client'
import type { Notification } from '@boilerplate/types'
import { NotificationStatus } from '@boilerplate/types'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  
  // Actions
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  markAsArchived: (id: string) => Promise<void>
  deleteNotification: (id: string) => Promise<void>
  createNotification: (notification: Omit<Notification, 'id' | 'status' | 'createdAt'>) => Promise<void>
  fetchNotifications: (params?: { status?: string; type?: string; limit?: number; offset?: number }) => Promise<void>
  
  // SSE connection
  isConnected: boolean
  reconnect: () => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  // Get authentication status
  const { data: session, isPending: authLoading } = useSession()
  const isAuthenticated = !!session?.user && !authLoading
  
  // Use TanStack Query hooks - only enable when authenticated
  const queryClient = useQueryClient()
  const { data: notifications = [], isLoading: loading, error: queryError } = useNotificationsQuery(undefined, { enabled: isAuthenticated })
  const { data: unreadCount = 0 } = useUnreadNotificationsCount({ enabled: isAuthenticated })
  const markAsReadMutation = useMarkNotificationAsRead()
  const markAllAsReadMutation = useMarkAllNotificationsAsRead()
  const deleteNotificationMutation = useDeleteNotification()
  
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Use refs to avoid recreating functions and store stable references
  const eventSourceRef = useRef<EventSource | null>(null)
  const initializeRef = useRef(false)
  
  // For web app, API is on the same domain
  
  // Update error state from query error
  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Failed to fetch notifications')
    } else {
      setError(null)
    }
  }, [queryError])

  // Refresh notifications using TanStack Query
  const fetchNotifications = useCallback(async (params?: { 
    status?: string
    type?: string
    limit?: number
    offset?: number 
  }) => {
    // Invalidate queries to refetch with new params
    await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() })
    await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
  }, [queryClient])

  // Mark notification as read using TanStack Query
  const markAsRead = useCallback(async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id)
    } catch (err) {
      console.error('Error marking notification as read:', err)
      setError('Failed to mark notification as read. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }, [markAsReadMutation])

  // Mark all notifications as read using TanStack Query
  const markAllAsRead = useCallback(async () => {
    try {
      if (unreadCount === 0) {
        return // Nothing to mark as read
      }
      await markAllAsReadMutation.mutateAsync()
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      setError('Failed to mark all notifications as read. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }, [markAllAsReadMutation, unreadCount])

  // Mark notification as archived (using delete for simplicity)
  const markAsArchived = useCallback(async (id: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(id)
    } catch (err) {
      console.error('Error archiving notification:', err)
      setError('Failed to archive notification. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }, [deleteNotificationMutation])

  // Delete notification using TanStack Query
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(id)
    } catch (err) {
      console.error('Error deleting notification:', err)
      setError('Failed to delete notification. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }, [deleteNotificationMutation])

  // Create notification with optimistic updates
  const createNotification = useCallback(async (notification: Omit<Notification, 'id' | 'status' | 'createdAt'>) => {
    try {
      // Add optimistic update
      const tempId = addNotificationOptimistically(queryClient, {
        ...notification,
        status: NotificationStatus.UNREAD,
        userId: '', // Will be set by backend
      })
      
      // In a real app, you'd call a mutation here to persist it
      // For now, we just add it optimistically via SSE
    } catch (err) {
      console.error('Error creating notification:', err)
      setError('Failed to create notification. Please try again.')
      setTimeout(() => setError(null), 3000)
    }
  }, [queryClient])

  // Set up SSE connection - stable function
  const connectToSSE = useCallback(() => {
    // Only connect if authenticated
    if (!isAuthenticated) {
      return
    }
    
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource(`/api/notifications/stream`, {
      withCredentials: true,
    })

    es.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    es.addEventListener('connected', (event) => {
      console.log('Connected to notification stream:', JSON.parse(event.data))
    })

    es.addEventListener('heartbeat', () => {
      // Keep connection alive
    })

    es.addEventListener('notification', (event) => {
      const notification = JSON.parse(event.data)
      
      // Update TanStack Query cache with new notification
      queryClient.setQueriesData(
        { queryKey: queryKeys.notifications.lists() },
        (oldData: Notification[] | undefined) => {
          if (!oldData) return [notification]
          return [notification, ...oldData]
        }
      )
      
      // Update unread count if it's unread
      if (notification.status === 'UNREAD') {
        queryClient.setQueryData(
          queryKeys.notifications.unreadCount(),
          (oldCount: number | undefined) => (oldCount || 0) + 1
        )
      }
    })

    es.onerror = () => {
      console.error('SSE connection error')
      setIsConnected(false)
      setError('Connection to notification stream lost')
      
      // Reconnect after 5 seconds
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connectToSSE()
        }
      }, 5000)
    }

    eventSourceRef.current = es
  }, [isAuthenticated])

  const reconnect = useCallback(() => {
    connectToSSE()
  }, [connectToSSE])

  // Initialize only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Close connection if not authenticated
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        setIsConnected(false)
      }
      return
    }
    
    if (initializeRef.current) return
    initializeRef.current = true
    
    fetchNotifications()
    connectToSSE()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [isAuthenticated, fetchNotifications, connectToSSE]) // Watch authentication status

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    markAsArchived,
    deleteNotification,
    createNotification,
    fetchNotifications,
    isConnected,
    reconnect,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}