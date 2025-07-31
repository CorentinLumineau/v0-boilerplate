'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { getBackendUrl } from '@boilerplate/config/project.config'

// Wrapper component to suppress React warnings from swagger-ui-react
function SwaggerUIWrapper({ spec }: { spec: any }) {
  useEffect(() => {
    // Suppress multiple types of warnings from swagger-ui-react and React 19 compatibility issues
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args: any[]) => {
      const message = args[0]
      if (typeof message === 'string') {
        // Suppress lifecycle warnings
        if (message.includes('UNSAFE_componentWillReceiveProps') ||
            message.includes('ModelCollapse') ||
            message.includes('OperationContainer')) {
          return
        }
        // Suppress DOM nesting warnings from swagger-ui-react
        if (message.includes('cannot be a descendant of') ||
            message.includes('hydration error') ||
            message.includes('validateDOMNesting')) {
          return
        }
        // Suppress other swagger-ui related warnings
        if (message.includes('swagger-ui') ||
            message.includes('renderedMarkdown')) {
          return
        }
      }
      originalError.apply(console, args)
    }

    console.warn = (...args: any[]) => {
      const message = args[0]
      if (typeof message === 'string') {
        // Suppress React 19 compatibility warnings from swagger-ui-react
        if (message.includes('swagger-ui') ||
            message.includes('UNSAFE_') ||
            message.includes('componentWill')) {
          return
        }
      }
      originalWarn.apply(console, args)
    }

    return () => {
      console.error = originalError
      console.warn = originalWarn
    }
  }, [])

  // Render in a way that minimizes hydration issues
  return (
    <div suppressHydrationWarning>
      <SwaggerUI
        spec={spec}
        docExpansion="list"
        defaultModelsExpandDepth={1}
        defaultModelExpandDepth={1}
        tryItOutEnabled={true}
        filter={true}
        displayRequestDuration={true}
        deepLinking={false}
        supportedSubmitMethods={['get', 'post', 'put', 'delete', 'patch']}
        requestInterceptor={(request: any) => {
          // Add credentials to requests for authentication
          request.credentials = 'include'
          return request
        }}
      />
    </div>
  )
}

export default function DocsPage() {
  const [spec, setSpec] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const backendUrl = getBackendUrl()
        const response = await fetch(`${backendUrl}/api/docs`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch API spec: ${response.status}`)
        }
        
        const specData = await response.json()
        setSpec(specData)
      } catch (err) {
        console.error('Error fetching Swagger spec:', err)
        setError(err instanceof Error ? err.message : 'Failed to load API documentation')
      } finally {
        setLoading(false)
      }
    }

    fetchSpec()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Loading API documentation...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Failed to Load Documentation
          </h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">
          No API specification found
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">API Documentation</h1>
        <p className="text-muted-foreground mt-2">
          Interactive API documentation powered by Swagger UI
        </p>
      </div>
      
      <div className="swagger-container">
        <SwaggerUIWrapper spec={spec} />
      </div>
    </div>
  )
}