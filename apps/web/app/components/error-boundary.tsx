'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardTitle, Button } from '@boilerplate/ui'
import { logger } from '@/lib/utils/logger'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    }, error)

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    this.setState({ error, errorInfo })
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Something went wrong</CardTitle>
              </div>
              
              <CardDescription className="mb-4">
                An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
              </CardDescription>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
                  <h4 className="font-medium text-sm mb-2">Error Details (Development)</h4>
                  <code className="text-xs text-destructive block whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </code>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleRetry} variant="default" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline" 
                  size="sm"
                >
                  Refresh Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Query Error Boundary specifically for TanStack Query errors
interface QueryErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error) => ReactNode
}

export function QueryErrorBoundary({ children, fallback }: QueryErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={fallback ? undefined : (
        <div className="flex items-center justify-center p-8">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Failed to load data</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There was an error loading the data. Please try again.
              </p>
              <Button onClick={() => window.location.reload()} size="sm">
                Reload
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      onError={(error, errorInfo) => {
        logger.error('Query Error Boundary caught an error', {
          error: error.message,
          componentStack: errorInfo.componentStack
        }, error)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}