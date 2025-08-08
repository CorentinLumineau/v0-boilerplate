import { TIMING } from '@/lib/config/constants'
import { logger } from '@/lib/utils/logger'

// Base types for API responses
export interface ApiResponse<T = any> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, any>
}

// Custom error class for API errors
export class ApiClientError extends Error {
  public status: number
  public code?: string
  public details?: Record<string, any>

  constructor(message: string, status: number, code?: string, details?: Record<string, any>) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.code = code
    this.details = details
  }
}

// HTTP methods type
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// Request options interface
interface RequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retry?: number
  signal?: AbortSignal
}

/**
 * Centralized API client with built-in error handling, retries, and logging
 */
export class ApiClient {
  private baseUrl: string
  private defaultTimeout: number
  private defaultRetry: number

  constructor(baseUrl = '/api', timeout = TIMING.API_TIMEOUT, retry = TIMING.MAX_RETRIES) {
    this.baseUrl = baseUrl
    this.defaultTimeout = timeout
    this.defaultRetry = retry
  }

  /**
   * Make an HTTP request with built-in error handling and retries
   */
  private async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retry = this.defaultRetry,
      signal
    } = options

    let retryCount = 0
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    // Default headers
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    while (retryCount <= retry) {
      let controller: AbortController | undefined
      let timeoutId: NodeJS.Timeout | undefined

      try {
        // Create abort controller if no signal provided
        if (!signal) {
          controller = new AbortController()
          timeoutId = setTimeout(() => controller?.abort(), timeout)
        }

        const requestInit: RequestInit = {
          method,
          headers: defaultHeaders,
          credentials: 'include',
          signal: signal || controller?.signal,
        }

        // Add body for non-GET requests
        if (body && method !== 'GET') {
          if (typeof body === 'object') {
            requestInit.body = JSON.stringify(body)
          } else {
            requestInit.body = body
          }
        }

        logger.apiDebug(`Making ${method} request to ${url}`, { 
          attempt: retryCount + 1,
          body: method !== 'GET' ? body : undefined
        })

        const response = await fetch(url, requestInit)

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Handle non-2xx responses
        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}: ${response.statusText}`
          let errorDetails: Record<string, any> = {}

          try {
            const errorBody = await response.text()
            if (errorBody) {
              try {
                const parsedError = JSON.parse(errorBody)
                errorMessage = parsedError.message || errorMessage
                errorDetails = parsedError.details || { body: errorBody }
              } catch {
                errorDetails = { body: errorBody }
              }
            }
          } catch {
            // Ignore JSON parse errors for error body
          }

          throw new ApiClientError(
            errorMessage,
            response.status,
            response.status.toString(),
            errorDetails
          )
        }

        // Parse response
        const responseText = await response.text()
        let responseData: ApiResponse<T>

        try {
          responseData = responseText ? JSON.parse(responseText) : { data: null, success: true }
        } catch {
          // If not JSON, wrap in ApiResponse format
          responseData = {
            data: responseText as T,
            success: true
          }
        }

        logger.apiDebug(`${method} request to ${url} succeeded`, {
          attempt: retryCount + 1,
          responseSize: responseText.length
        })

        return responseData

      } catch (error) {
        retryCount++

        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Determine if we should retry
        const shouldRetry = this.shouldRetry(error, retryCount, retry)

        logger.apiError(`${method} request to ${url} failed`, {
          error: error instanceof Error ? error.message : String(error),
          attempt: retryCount,
          willRetry: shouldRetry
        }, error instanceof Error ? error : undefined)

        if (!shouldRetry) {
          if (error instanceof ApiClientError) {
            throw error
          }
          
          // Handle timeout errors
          if (error instanceof Error && error.name === 'AbortError') {
            throw new ApiClientError('Request timeout', 408, 'TIMEOUT')
          }
          
          // Handle network errors
          throw new ApiClientError(
            error instanceof Error ? error.message : 'Network error',
            0,
            'NETWORK_ERROR'
          )
        }

        // Wait before retry with exponential backoff
        const delay = TIMING.RETRY_DELAY_BASE * Math.pow(2, retryCount - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw new ApiClientError('Max retries exceeded', 0, 'MAX_RETRIES_EXCEEDED')
  }

  /**
   * Determine if a request should be retried based on the error
   */
  private shouldRetry(error: unknown, retryCount: number, maxRetries: number): boolean {
    if (retryCount > maxRetries) {
      return false
    }

    if (error instanceof ApiClientError) {
      // Don't retry client errors (4xx) except for specific cases
      if (error.status >= 400 && error.status < 500) {
        return error.status === 408 || error.status === 429 // Timeout or Rate Limit
      }
      
      // Retry server errors (5xx)
      return error.status >= 500
    }

    // Don't retry timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return false
    }

    // Retry network errors
    return true
  }

  // Convenience methods
  async get<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async patch<T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  async delete<T = any>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

// Create default API client instance
export const apiClient = new ApiClient()

// Helper function to handle API errors in React Query
export function handleApiError(error: unknown): never {
  if (error instanceof ApiClientError) {
    throw error
  }
  
  if (error instanceof Error) {
    throw new ApiClientError(error.message, 0, 'UNKNOWN_ERROR')
  }
  
  throw new ApiClientError('An unknown error occurred', 0, 'UNKNOWN_ERROR')
}