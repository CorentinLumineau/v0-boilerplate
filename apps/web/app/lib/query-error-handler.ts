import { toast } from '@/hooks/use-toast'
import { logger } from '@/lib/utils/logger'
import { ApiClientError } from '@/lib/api-client'

/**
 * Global error handler for TanStack Query
 * Provides consistent error handling and user feedback across the application
 */

export interface ErrorHandlerOptions {
  showToast?: boolean
  toastTitle?: string
  logError?: boolean
  context?: Record<string, any>
}

export function handleQueryError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showToast = true,
    toastTitle,
    logError = true,
    context = {}
  } = options

  let errorMessage = 'An unexpected error occurred'
  let errorTitle = toastTitle
  let statusCode: number | undefined

  // Handle different error types
  if (error instanceof ApiClientError) {
    errorMessage = error.message
    statusCode = error.status
    
    // Customize error messages based on status code
    switch (error.status) {
      case 401:
        errorTitle = errorTitle || 'Authentication Required'
        errorMessage = 'Please sign in to continue'
        break
      case 403:
        errorTitle = errorTitle || 'Access Denied'
        errorMessage = 'You don\'t have permission to perform this action'
        break
      case 404:
        errorTitle = errorTitle || 'Not Found'
        errorMessage = 'The requested resource was not found'
        break
      case 409:
        errorTitle = errorTitle || 'Conflict'
        errorMessage = 'The request conflicts with existing data'
        break
      case 422:
        errorTitle = errorTitle || 'Validation Error'
        errorMessage = 'Please check your input and try again'
        break
      case 429:
        errorTitle = errorTitle || 'Too Many Requests'
        errorMessage = 'Please wait a moment before trying again'
        break
      case 500:
        errorTitle = errorTitle || 'Server Error'
        errorMessage = 'Our servers are experiencing issues. Please try again later'
        break
      case 502:
      case 503:
      case 504:
        errorTitle = errorTitle || 'Service Unavailable'
        errorMessage = 'The service is temporarily unavailable. Please try again later'
        break
      default:
        errorTitle = errorTitle || 'Request Failed'
    }
  } else if (error instanceof Error) {
    errorMessage = error.message
    
    // Handle specific error types
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      errorTitle = errorTitle || 'Connection Error'
      errorMessage = 'Please check your internet connection and try again'
    } else if (error.name === 'TimeoutError') {
      errorTitle = errorTitle || 'Request Timeout'
      errorMessage = 'The request took too long to complete. Please try again'
    } else if (error.name === 'AbortError') {
      errorTitle = errorTitle || 'Request Cancelled'
      errorMessage = 'The request was cancelled'
    }
  } else if (typeof error === 'string') {
    errorMessage = error
  }

  // Log the error
  if (logError) {
    logger.error('Query error handled', {
      message: errorMessage,
      title: errorTitle,
      statusCode,
      errorType: error instanceof Error ? error.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
      ...context
    }, error instanceof Error ? error : undefined)
  }

  // Show toast notification
  if (showToast) {
    // Don't show toast for certain error types that are handled elsewhere
    const shouldShowToast = !(
      statusCode === 401 || // Authentication handled by auth system
      error instanceof Error && error.name === 'AbortError' // Cancelled requests
    )

    if (shouldShowToast) {
      toast({
        variant: "destructive",
        title: errorTitle || "Error",
        description: errorMessage,
        duration: statusCode === 500 ? 8000 : 5000, // Show server errors longer
      })
    }
  }
}

/**
 * Default error handler for query client
 * Can be used in QueryClient defaultOptions
 */
export const defaultQueryErrorHandler = (error: unknown) => {
  handleQueryError(error, {
    showToast: true,
    logError: true,
  })
}

/**
 * Silent error handler for queries that should not show toasts
 * Useful for background queries or polling
 */
export const silentQueryErrorHandler = (error: unknown, context?: Record<string, any>) => {
  handleQueryError(error, {
    showToast: false,
    logError: true,
    context,
  })
}

/**
 * Critical error handler for important operations
 * Shows persistent error messages that require user attention
 */
export const criticalQueryErrorHandler = (error: unknown, context?: Record<string, any>) => {
  handleQueryError(error, {
    showToast: true,
    logError: true,
    toastTitle: 'Critical Error',
    context,
  })
  
  // For critical errors, also show persistent toast
  if (error instanceof ApiClientError || error instanceof Error) {
    toast({
      variant: "destructive",
      title: "Critical Error",
      description: 'This error requires immediate attention. Please contact support if it persists.',
      duration: Infinity, // Make it persistent
    })
  }
}

/**
 * Mutation error handler with success/error feedback
 */
export const mutationErrorHandler = (
  error: unknown,
  operation: string,
  context?: Record<string, any>
) => {
  const errorTitle = `Failed to ${operation}`
  
  handleQueryError(error, {
    showToast: true,
    logError: true,
    toastTitle: errorTitle,
    context: {
      operation,
      ...context
    },
  })
}

/**
 * Success handler for mutations
 */
export const mutationSuccessHandler = (
  data: unknown,
  operation: string,
  options: {
    showToast?: boolean
    message?: string
    context?: Record<string, any>
  } = {}
) => {
  const {
    showToast = true,
    message = `${operation} completed successfully`,
    context = {}
  } = options

  logger.info('Mutation completed successfully', {
    operation,
    ...context
  })

  if (showToast) {
    toast({
      title: "Success",
      description: message,
    })
  }
}