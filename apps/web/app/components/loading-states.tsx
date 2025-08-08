'use client'

import React from 'react'
import { Card, CardContent, Button } from '@boilerplate/ui'
import { Loader2, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

// Generic loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}

// Skeleton loader for content
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-muted rounded-md', className)} />
  )
}

// Card skeleton loader
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// List skeleton loader
export function ListSkeleton({ items = 3, className }: { items?: number; className?: string }) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Full page loading
interface PageLoadingProps {
  message?: string
  className?: string
}

export function PageLoading({ message = 'Loading...', className }: PageLoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center min-h-[400px] p-8', className)}>
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Query loading states
export function QueryLoading({ message = 'Loading data...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <LoadingSpinner />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  )
}

// Error states
interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  className?: string
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  retry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  )
}

// Network error state
export function NetworkErrorState({ retry }: { retry?: () => void }) {
  return (
    <ErrorState
      title="Connection Error"
      message="Unable to connect to the server. Please check your internet connection and try again."
      retry={retry}
    />
  )
}

// Empty state
interface EmptyStateProps {
  title?: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = 'No data found',
  message = 'There is no data to display at the moment.',
  action,
  icon,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Connection status indicator
export function ConnectionStatus({ isOnline }: { isOnline: boolean }) {
  return (
    <div className={cn(
      'flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium',
      isOnline 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    )}>
      {isOnline ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      )}
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  )
}

// Loading button
interface LoadingButtonProps {
  loading?: boolean
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function LoadingButton({
  loading = false,
  children,
  disabled,
  onClick,
  variant = 'default',
  size = 'default',
  className
}: LoadingButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </Button>
  )
}

// Query state wrapper component
interface QueryStateWrapperProps {
  isLoading: boolean
  isError: boolean
  error?: Error | null
  isEmpty?: boolean
  loadingComponent?: React.ReactNode
  errorComponent?: React.ReactNode
  emptyComponent?: React.ReactNode
  children: React.ReactNode
  retry?: () => void
}

export function QueryStateWrapper({
  isLoading,
  isError,
  error,
  isEmpty = false,
  loadingComponent,
  errorComponent,
  emptyComponent,
  children,
  retry
}: QueryStateWrapperProps) {
  if (isLoading) {
    return <>{loadingComponent || <QueryLoading />}</>
  }

  if (isError) {
    return <>{errorComponent || <ErrorState retry={retry} />}</>
  }

  if (isEmpty) {
    return <>{emptyComponent || <EmptyState />}</>
  }

  return <>{children}</>
}