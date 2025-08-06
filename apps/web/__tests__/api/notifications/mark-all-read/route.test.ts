/**
 * Tests for the mark all notifications as read API route
 * Tests PATCH /api/notifications/mark-all-read
 */

import { PATCH } from '@/api/notifications/mark-all-read/route'
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
      updateMany: jest.fn()
    }
  }
}))

// Mock console.error to avoid noise in tests
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {})

const mockAuth = auth as jest.Mocked<typeof auth>
const mockHeaders = headers as jest.MockedFunction<typeof headers>
const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('/api/notifications/mark-all-read', () => {
  const createMockRequest = (url = 'http://localhost:3000/api/notifications/mark-all-read') => {
    return new NextRequest(url, { method: 'PATCH' })
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

  describe('PATCH', () => {
    it('should mark all unread notifications as read for authenticated user', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 })

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual({
        message: 'All notifications marked as read',
        updatedCount: 3
      })
    })

    it('should return 401 for unauthenticated requests', async () => {
      mockAuth.api.getSession.mockResolvedValue(null)

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(401)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Unauthorized' })
    })

    it('should update notifications with correct parameters', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 })

      const request = createMockRequest()
      await PATCH(request)

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          userId: 'test-user-id',
          status: 'UNREAD',
        },
        data: {
          status: 'READ',
          readAt: expect.any(Date),
        },
      })
    })

    it('should set readAt timestamp correctly', async () => {
      const beforeTime = new Date()
      
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 2 })

      const request = createMockRequest()
      await PATCH(request)

      const afterTime = new Date()
      const updateCall = mockPrisma.notification.updateMany.mock.calls[0]
      const readAtTime = updateCall[0].data.readAt

      expect(readAtTime).toBeInstanceOf(Date)
      expect(readAtTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(readAtTime.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })

    it('should return zero count when no notifications to update', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 0 })

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual({
        message: 'All notifications marked as read',
        updatedCount: 0
      })
    })

    it('should handle session retrieval with correct headers', async () => {
      const mockHeadersValue = new Headers({ 'cookie': 'test-cookie' })
      mockHeaders.mockResolvedValue(mockHeadersValue)
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 })

      const request = createMockRequest()
      await PATCH(request)

      expect(mockHeaders).toHaveBeenCalled()
      expect(mockAuth.api.getSession).toHaveBeenCalledWith({
        headers: mockHeadersValue
      })
    })

    it('should return 500 on database error', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should return 500 on session retrieval error', async () => {
      mockAuth.api.getSession.mockRejectedValue(new Error('Session error'))

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should log errors when they occur', async () => {
      const testError = new Error('Test database error')
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockRejectedValue(testError)

      const request = createMockRequest()
      await PATCH(request)

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error marking all notifications as read:',
        testError
      )
    })

    it('should handle large update counts', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 10000 })

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual({
        message: 'All notifications marked as read',
        updatedCount: 10000
      })
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
        mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 })

        const request = createMockRequest()
        await PATCH(request)

        expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
          where: {
            userId: session.user.id,
            status: 'UNREAD',
          },
          data: {
            status: 'READ',
            readAt: expect.any(Date),
          },
        })
      }
    })

    it('should handle headers function errors', async () => {
      mockHeaders.mockRejectedValue(new Error('Headers error'))

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should maintain transaction consistency', async () => {
      // This tests that updateMany is called exactly once per request
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 7 })

      const request = createMockRequest()
      await PATCH(request)

      expect(mockPrisma.notification.updateMany).toHaveBeenCalledTimes(1)
    })

    it('should handle database constraint errors', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockRejectedValue(new Error('Foreign key constraint'))

      const request = createMockRequest()
      const response = await PATCH(request)

      expect(response.status).toBe(500)
      
      const data = await response.json()
      expect(data).toEqual({ error: 'Internal server error' })
    })

    it('should only update UNREAD notifications', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 })

      const request = createMockRequest()
      await PATCH(request)

      const updateCall = mockPrisma.notification.updateMany.mock.calls[0]
      expect(updateCall[0].where.status).toBe('UNREAD')
    })

    it('should set status to READ and timestamp simultaneously', async () => {
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 1 })

      const request = createMockRequest()
      await PATCH(request)

      const updateCall = mockPrisma.notification.updateMany.mock.calls[0]
      expect(updateCall[0].data).toEqual({
        status: 'READ',
        readAt: expect.any(Date)
      })
    })
  })
})