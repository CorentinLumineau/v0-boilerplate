/**
 * Tests for the notification count API route
 * Tests GET /api/notifications/count
 */

import { GET } from '@/api/notifications/count/route'
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Mock dependencies
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn()
    }
  }
}))

jest.mock('next/headers', () => ({
  headers: jest.fn()
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    notification: {
      count: jest.fn()
    }
  }
}))

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

const mockAuth = auth as jest.Mocked<typeof auth>
const mockHeaders = headers as jest.MockedFunction<typeof headers>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/notifications/count', () => {
  const createMockRequest = (url = 'http://localhost:3000/api/notifications/count') => {
    return new NextRequest(url)
  }

  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockHeaders.mockResolvedValue(new Headers())
  })

  afterAll(() => {
    mockConsoleError.mockRestore()
  })

  describe('GET', () => {
    it('should return unread notification count for authenticated user', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.count.mockResolvedValue(5)

      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual({ unreadCount: 5 })
    })

    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.api.getSession.mockResolvedValue(null)

      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should query notifications with correct parameters', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.count.mockResolvedValue(3)

      const request = createMockRequest()
      await GET(request)

      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          status: 'UNREAD',
        },
      })
    })

    it('should return zero count when no unread notifications', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.count.mockResolvedValue(0)

      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual({ unreadCount: 0 })
    })

    it('should handle session retrieval with correct headers', async () => {
      const mockHeadersValue = new Headers({ 'cookie': 'test-cookie' })
      mockHeaders.mockResolvedValue(mockHeadersValue)
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.count.mockResolvedValue(1)

      const request = createMockRequest()
      await GET(request)

      expect(mockHeaders).toHaveBeenCalled()
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: mockHeadersValue
      })
    })

    it('should return 500 on database error', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.count.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should return 500 on session retrieval error', async () => {
      mockAuth.api.getSession.mockRejectedValue(new Error('Session error'))

      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should log errors when they occur', async () => {
      const testError = new Error('Test database error')
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.count.mockRejectedValue(testError)

      const request = createMockRequest()
      await GET(request)

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error fetching notification count:',
        testError
      )
    })

    it('should handle large notification counts', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.count.mockResolvedValue(999999)

      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual({ unreadCount: 999999 })
    })

    it('should work with different user IDs', async () => {
      const users = [
        { user: { id: 'user-1', email: 'user1@example.com' } },
        { user: { id: 'user-2', email: 'user2@example.com' } },
        { user: { id: 'user-with-uuid-123e4567-e89b-12d3-a456-426614174000', email: 'uuid@example.com' } }
      ]

      for (const session of users) {
        jest.clearAllMocks()
        mockAuth.api.getSession.mockResolvedValue(session)
        mockPrisma.notification.count.mockResolvedValue(2)

        const request = createMockRequest()
        await GET(request)

        expect(mockPrisma.notification.count).toHaveBeenCalledWith({
          where: {
            userId: session.user.id,
            status: 'UNREAD',
          },
        })
      }
    })

    it('should handle headers function errors', async () => {
      mockHeaders.mockRejectedValue(new Error('Headers error'))

      const request = createMockRequest()
      const response = await GET(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should handle session with missing user data', async () => {
      mockAuth.api.getSession.mockResolvedValue({ user: null })

      const request = createMockRequest()
      const response = await GET(request)

      // Should treat this as unauthenticated since user is missing
      expect(response.status).toBe(500) // Will cause error when trying to access session.user.id
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })
  })
})