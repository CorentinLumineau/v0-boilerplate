'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardTitle, Button } from '@boilerplate/ui'
import { 
  useHealthStatus, 
  useCurrentUser, 
  useUpdateCurrentUser,
  useNotifications,
  useMarkNotificationAsRead 
} from '@/lib/queries'
import { 
  QueryStateWrapper, 
  LoadingButton,
  ConnectionStatus 
} from '@/components/loading-states'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { toast } from '@/hooks/use-toast'

/**
 * Example components demonstrating TanStack Query usage with comprehensive error handling
 * These examples show best practices for loading states, error handling, and user feedback
 */

// Health Status Example
export function HealthStatusExample() {
  const { data: health, isLoading, isError, error, refetch } = useHealthStatus()

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>API Health Status</CardTitle>
          <ConnectionStatus isOnline={useOnlineStatus()} />
        </div>
        
        <QueryStateWrapper
          isLoading={isLoading}
          isError={isError}
          error={error}
          retry={refetch}
          loadingComponent={<p>Checking API health...</p>}
          errorComponent={<p className="text-destructive">Failed to check API health</p>}
        >
          {health && (
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Status:</span>{' '}
                <span className={health.status === 'ok' ? 'text-green-600' : 'text-red-600'}>
                  {health.status}
                </span>
              </p>
              <p className="text-sm">
                <span className="font-medium">Message:</span> {health.message}
              </p>
              <p className="text-xs text-muted-foreground">
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </QueryStateWrapper>
        
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
          Refresh
        </Button>
      </CardContent>
    </Card>
  )
}

// User Profile Example with Mutation
export function UserProfileExample() {
  const { data: user, isLoading, isError, error } = useCurrentUser()
  const updateUser = useUpdateCurrentUser()

  const handleUpdateProfile = async () => {
    try {
      await updateUser.mutateAsync({
        name: 'Updated Name'
      })
      toast({
        title: "Success",
        description: 'Profile updated successfully!'
      })
    } catch (error) {
      // Error handling is done automatically by the mutation error handler
      console.error('Update failed:', error)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <CardTitle className="mb-4">User Profile</CardTitle>
        
        <QueryStateWrapper
          isLoading={isLoading}
          isError={isError}
          error={error}
          loadingComponent={<p>Loading user profile...</p>}
          errorComponent={<p className="text-destructive">Failed to load profile</p>}
        >
          {user && (
            <div className="space-y-3">
              <p><span className="font-medium">Name:</span> {user.name}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
              
              <LoadingButton
                loading={updateUser.isPending}
                onClick={handleUpdateProfile}
                className="mt-4"
              >
                Update Profile
              </LoadingButton>
              
              {updateUser.isError && (
                <p className="text-sm text-destructive">
                  Update failed. Please try again.
                </p>
              )}
            </div>
          )}
        </QueryStateWrapper>
      </CardContent>
    </Card>
  )
}

// Notifications Example with Actions
export function NotificationsExample() {
  const { data: notifications, isLoading, isError, error, refetch } = useNotifications({
    limit: 5
  })
  const markAsRead = useMarkNotificationAsRead()

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead.mutateAsync(notificationId)
      // Success feedback is handled automatically
    } catch (error) {
      // Error handling is done automatically
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>Recent Notifications</CardTitle>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            Refresh
          </Button>
        </div>
        
        <QueryStateWrapper
          isLoading={isLoading}
          isError={isError}
          error={error}
          isEmpty={!notifications || notifications.length === 0}
          retry={refetch}
          loadingComponent={<p>Loading notifications...</p>}
          errorComponent={<p className="text-destructive">Failed to load notifications</p>}
          emptyComponent={<p className="text-muted-foreground">No notifications found</p>}
        >
          <div className="space-y-3">
            {notifications?.map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                
                {notification.status === 'UNREAD' && (
                  <LoadingButton
                    loading={markAsRead.isPending}
                    onClick={() => handleMarkAsRead(notification.id)}
                    variant="outline"
                    size="sm"
                  >
                    Mark Read
                  </LoadingButton>
                )}
              </div>
            ))}
          </div>
        </QueryStateWrapper>
      </CardContent>
    </Card>
  )
}

// Combined Example Page
export function QueryExamplesPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">TanStack Query Examples</h1>
        <p className="text-muted-foreground">
          Examples demonstrating comprehensive error handling, loading states, and user feedback
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <HealthStatusExample />
        <UserProfileExample />
        <NotificationsExample />
      </div>
      
      <Card>
        <CardContent className="p-6">
          <CardTitle className="mb-4">Features Demonstrated</CardTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Query Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Automatic error handling with toast notifications</li>
                <li>• Loading states and skeleton loaders</li>
                <li>• Empty state handling</li>
                <li>• Connection status monitoring</li>
                <li>• Retry mechanisms</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Mutation Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Optimistic updates</li>
                <li>• Success/error feedback</li>
                <li>• Loading button states</li>
                <li>• Cache invalidation</li>
                <li>• Error recovery</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}