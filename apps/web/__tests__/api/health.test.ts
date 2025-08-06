/**
 * @jest-environment node
 */

import { GET } from '@/api/health/route'
import { NextRequest, NextResponse } from 'next/server'
import type { HealthCheckResponse } from '@boilerplate/types'

// Mock NextRequest
const createMockRequest = (url: string = 'http://localhost:3000/api/health') => {
  return new NextRequest(url, { method: 'GET' })
}

describe('/api/health', () => {
  describe('GET /api/health', () => {
    it('should return 200 and healthy status', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data: HealthCheckResponse = await response.json()
      expect(data.status).toBe('healthy')
      expect(data.service).toBe('boilerplate-backend-nextjs')
      expect(data.timestamp).toBeDefined()
      expect(typeof data.timestamp).toBe('string')
    })

    it('should return valid timestamp format', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const data: HealthCheckResponse = await response.json()
      
      // Check if timestamp is valid ISO 8601 format
      const timestamp = new Date(data.timestamp)
      expect(timestamp.toISOString()).toBe(data.timestamp)
      expect(isNaN(timestamp.getTime())).toBe(false)
    })

    it('should return correct content type', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.headers.get('content-type')).toBe('application/json')
    })

    it('should have consistent response structure', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const data: HealthCheckResponse = await response.json()
      
      // Verify all required fields are present
      expect(data).toHaveProperty('status')
      expect(data).toHaveProperty('timestamp')
      expect(data).toHaveProperty('service')
      
      // Verify types
      expect(typeof data.status).toBe('string')
      expect(typeof data.timestamp).toBe('string')
      expect(typeof data.service).toBe('string')
    })

    it('should handle different request URLs', async () => {
      const request = createMockRequest('http://example.com/api/health')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data: HealthCheckResponse = await response.json()
      expect(data.status).toBe('healthy')
      expect(data.service).toBe('boilerplate-backend-nextjs')
    })

    it('should return timestamp close to current time', async () => {
      const beforeRequest = new Date()
      const request = createMockRequest()
      const response = await GET(request)
      const afterRequest = new Date()
      
      const data: HealthCheckResponse = await response.json()
      const responseTimestamp = new Date(data.timestamp)
      
      expect(responseTimestamp.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime())
      expect(responseTimestamp.getTime()).toBeLessThanOrEqual(afterRequest.getTime())
    })
  })

  describe('Error handling', () => {
    // Test error scenarios by mocking console.error
    const originalConsoleError = console.error
    
    beforeEach(() => {
      console.error = jest.fn()
    })
    
    afterEach(() => {
      console.error = originalConsoleError
    })

    it('should handle errors gracefully', async () => {
      // Mock NextResponse.json to throw an error in the try block  
      const originalJsonMethod = NextResponse.json
      NextResponse.json = jest.fn().mockImplementationOnce(() => {
        throw new Error('Mock NextResponse error')
      }).mockImplementationOnce((data) => {
        // Second call (in catch block) should succeed
        return originalJsonMethod(data, { status: 500, headers: { 'Content-Type': 'application/json' } })
      })
      
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      expect(console.error).toHaveBeenCalledWith('Health check error:', expect.any(Error))
      
      // Restore NextResponse.json
      NextResponse.json = originalJsonMethod
    })

    it('should return unhealthy status on error with proper structure', async () => {
      // Mock NextResponse.json to throw an error in the try block  
      const originalJsonMethod = NextResponse.json
      NextResponse.json = jest.fn().mockImplementationOnce(() => {
        throw new Error('Mock NextResponse error')
      }).mockImplementationOnce((data, options) => {
        // Second call (in catch block) should succeed
        return originalJsonMethod(data, options)
      })
      
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      
      const data: HealthCheckResponse = await response.json()
      expect(data.status).toBe('unhealthy')
      expect(data.service).toBe('boilerplate-backend-nextjs')
      expect(data.timestamp).toBeDefined()
      
      // Restore NextResponse.json
      NextResponse.json = originalJsonMethod
    })
  })
})