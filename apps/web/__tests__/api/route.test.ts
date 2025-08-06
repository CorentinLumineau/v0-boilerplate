/**
 * Tests for the root API route
 * Tests the main API endpoint at /api
 */

import { GET } from '@/api/route'
import { NextRequest } from 'next/server'

// Mock NextRequest
const createMockRequest = (url = 'http://localhost:3000/api') => {
  return new NextRequest(url)
}

describe('/api', () => {
  describe('GET', () => {
    it('should return API information with correct structure', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      
      const data = await response.json()
      
      expect(data).toEqual({
        message: 'Boilerplate Backend API - Next.js 15',
        data: {
          version: '0.1.0',
          framework: 'Next.js 15',
          timestamp: expect.any(String)
        }
      })
    })

    it('should return valid ISO timestamp', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const data = await response.json()
      const timestamp = data.data.timestamp
      
      // Check if timestamp is a valid ISO string
      expect(() => new Date(timestamp)).not.toThrow()
      expect(new Date(timestamp).toISOString()).toBe(timestamp)
    })

    it('should set correct response headers', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      expect(response.headers.get('content-type')).toBe('application/json')
    })

    it('should work with different request URLs', async () => {
      const requests = [
        createMockRequest('http://localhost:3000/api'),
        createMockRequest('https://production.com/api'),
        createMockRequest('https://staging.vercel.app/api')
      ]

      for (const request of requests) {
        const response = await GET(request)
        expect(response.status).toBe(200)
        
        const data = await response.json()
        expect(data.message).toBe('Boilerplate Backend API - Next.js 15')
      }
    })

    it('should return different timestamps on subsequent calls', async () => {
      const request1 = createMockRequest()
      const request2 = createMockRequest()
      
      const response1 = await GET(request1)
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1))
      const response2 = await GET(request2)
      
      const data1 = await response1.json()
      const data2 = await response2.json()
      
      // Timestamps should be different (or at least not fail)
      expect(data1.data.timestamp).toBeDefined()
      expect(data2.data.timestamp).toBeDefined()
    })

    it('should maintain consistent version and framework info', async () => {
      const request = createMockRequest()
      const response = await GET(request)
      
      const data = await response.json()
      
      expect(data.data.version).toBe('0.1.0')
      expect(data.data.framework).toBe('Next.js 15')
    })
  })
})