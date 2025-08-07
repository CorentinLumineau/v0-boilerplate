/**
 * Comprehensive tests for the preferences API endpoint
 * Tests all scenarios including authentication, validation, database operations, and error handling
 */

import { GET, PATCH } from '../../app/api/preferences/route'
import { logger } from '@/lib/utils/logger'
import { API } from '@/lib/config/constants'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Import mocked NextRequest from next/server
const { NextRequest } = require('next/server')

// Get mocked modules (already mocked in setup)
const mockAuth = auth as jest.Mocked<typeof auth>
const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockLogger = logger as jest.Mocked<typeof logger>

// Helper function to create mock request
const createMockRequest = (method: string, body?: any) => {
  const url = 'http://localhost:3000/api/preferences'
  const init: any = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  
  if (body) {
    init.body = JSON.stringify(body)
  }
  
  return new NextRequest(url, init)
}

// Headers are already mocked in jest.setup.node.js

describe('/api/preferences', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/preferences', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        mockAuth.api.getSession.mockResolvedValue(null)
        
        const request = createMockRequest('GET')
        const response = await GET()
        
        expect(response.status).toBe(API.STATUS_CODES.UNAUTHORIZED)
        expect(mockLogger.apiWarn).toHaveBeenCalledWith('GET /api/preferences - No session found')
        
        const body = await response.json()
        expect(body).toEqual({ error: 'Unauthorized' })
      })
      
      it('should process request when user is authenticated', async () => {
        const mockSession = {
          user: { id: 'test_user_123' }
        }
        mockAuth.api.getSession.mockResolvedValue(mockSession)
        mockPrisma.userPreferences.findUnique.mockResolvedValue(null)
        mockPrisma.userPreferences.create.mockResolvedValue({
          colorTheme: 'DEFAULT',
          language: 'EN',
          themeMode: 'SYSTEM'
        })
        
        const response = await GET()
        
        expect(response.status).toBe(200)
        expect(mockLogger.apiDebug).toHaveBeenCalledWith(
          'GET /api/preferences - User ID',
          { userId: 'test_user_123' }
        )
      })
    })

    describe('Database Operations', () => {
      const mockSession = { user: { id: 'test_user_123' } }
      
      beforeEach(() => {
        mockAuth.api.getSession.mockResolvedValue(mockSession)
      })

      it('should return existing preferences when found', async () => {
        const mockPreferences = {
          colorTheme: 'BLUE',
          language: 'FR',
          themeMode: 'DARK'
        }
        mockPrisma.userPreferences.findUnique.mockResolvedValue(mockPreferences)
        
        const response = await GET()
        
        expect(response.status).toBe(200)
        expect(mockPrisma.userPreferences.findUnique).toHaveBeenCalledWith({
          where: { userId: 'test_user_123' },
          select: {
            colorTheme: true,
            language: true,
            themeMode: true
          }
        })
        
        const body = await response.json()
        expect(body.data).toEqual({
          colorTheme: 'blue',
          language: 'fr',
          themeMode: 'dark'
        })
      })
      
      it('should create default preferences when none exist', async () => {
        mockPrisma.userPreferences.findUnique.mockResolvedValue(null)
        const defaultPrefs = {
          colorTheme: 'DEFAULT',
          language: 'EN',
          themeMode: 'SYSTEM'
        }
        mockPrisma.userPreferences.create.mockResolvedValue(defaultPrefs)
        
        const response = await GET()
        
        expect(response.status).toBe(200)
        expect(mockPrisma.userPreferences.create).toHaveBeenCalledWith({
          data: {
            userId: 'test_user_123',
            colorTheme: 'DEFAULT',
            language: 'EN',
            themeMode: 'SYSTEM'
          },
          select: {
            colorTheme: true,
            language: true,
            themeMode: true
          }
        })
        
        const body = await response.json()
        expect(body.data).toEqual({
          colorTheme: 'default',
          language: 'en',
          themeMode: 'system'
        })
        
        expect(mockLogger.apiInfo).toHaveBeenCalledWith(
          'GET /api/preferences - Creating default preferences',
          { userId: 'test_user_123' }
        )
      })
    })

    describe('Error Handling', () => {
      it('should handle database errors gracefully', async () => {
        const mockSession = { user: { id: 'test_user_123' } }
        mockAuth.api.getSession.mockResolvedValue(mockSession)
        
        const dbError = new Error('Database connection failed')
        mockPrisma.userPreferences.findUnique.mockRejectedValue(dbError)
        
        const response = await GET()
        
        expect(response.status).toBe(API.STATUS_CODES.INTERNAL_SERVER_ERROR)
        expect(mockLogger.apiError).toHaveBeenCalledWith(
          'GET /api/preferences - Error',
          { error: 'Database connection failed' },
          dbError
        )
        
        const body = await response.json()
        expect(body).toEqual({ error: 'Internal server error' })
      })
    })
  })

  describe('PATCH /api/preferences', () => {
    describe('Authentication', () => {
      it('should return 401 when user is not authenticated', async () => {
        mockAuth.api.getSession.mockResolvedValue(null)
        
        const request = createMockRequest('PATCH', {
          preferences: { colorTheme: 'red' }
        })
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.UNAUTHORIZED)
        expect(mockLogger.apiWarn).toHaveBeenCalledWith('PATCH /api/preferences - No session found')
      })
    })

    describe('Request Validation', () => {
      const mockSession = { user: { id: 'test_user_123' } }
      
      beforeEach(() => {
        mockAuth.api.getSession.mockResolvedValue(mockSession)
      })

      it('should reject invalid request structure', async () => {
        const request = createMockRequest('PATCH', { invalid: 'data' })
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.BAD_REQUEST)
        
        const body = await response.json()
        expect(body.error).toBe('Invalid preferences data')
        expect(body.details).toBeDefined()
        
        expect(mockLogger.apiWarn).toHaveBeenCalledWith(
          'PATCH /api/preferences - Invalid request data',
          expect.objectContaining({
            userId: 'test_user_123',
            errors: expect.any(Array),
            receivedData: { invalid: 'data' }
          })
        )
      })
      
      it('should reject invalid preference values', async () => {
        const request = createMockRequest('PATCH', {
          preferences: {
            colorTheme: 'invalid_color',
            language: 'invalid_lang',
            themeMode: 'invalid_mode'
          }
        })
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.BAD_REQUEST)
        
        const body = await response.json()
        expect(body.error).toBe('Invalid preferences data')
        expect(body.details).toHaveLength(3) // Should have 3 validation errors
      })
      
      it('should accept valid preference values', async () => {
        const validPreferences = {
          preferences: {
            colorTheme: 'red',
            language: 'fr',
            themeMode: 'dark'
          }
        }
        
        mockPrisma.userPreferences.upsert.mockResolvedValue({
          colorTheme: 'RED',
          language: 'FR',
          themeMode: 'DARK'
        })
        
        const request = createMockRequest('PATCH', validPreferences)
        const response = await PATCH(request)
        
        expect(response.status).toBe(200)
        expect(mockLogger.apiDebug).toHaveBeenCalledWith(
          'PATCH /api/preferences - Validated preferences',
          {
            userId: 'test_user_123',
            preferences: validPreferences.preferences
          }
        )
      })
    })

    describe('Database Operations', () => {
      const mockSession = { user: { id: 'test_user_123' } }
      
      beforeEach(() => {
        mockAuth.api.getSession.mockResolvedValue(mockSession)
      })

      it('should upsert preferences with correct data mapping', async () => {
        const requestData = {
          preferences: {
            colorTheme: 'blue',
            language: 'fr',
            themeMode: 'dark'
          }
        }
        
        const dbResponse = {
          colorTheme: 'BLUE',
          language: 'FR',
          themeMode: 'DARK'
        }
        mockPrisma.userPreferences.upsert.mockResolvedValue(dbResponse)
        
        const request = createMockRequest('PATCH', requestData)
        const response = await PATCH(request)
        
        expect(response.status).toBe(200)
        expect(mockPrisma.userPreferences.upsert).toHaveBeenCalledWith({
          where: { userId: 'test_user_123' },
          create: {
            userId: 'test_user_123',
            colorTheme: 'BLUE',
            language: 'FR',
            themeMode: 'DARK'
          },
          update: {
            colorTheme: 'BLUE',
            language: 'FR',
            themeMode: 'DARK'
          },
          select: {
            colorTheme: true,
            language: true,
            themeMode: true
          }
        })
        
        const body = await response.json()
        expect(body.data).toEqual({
          colorTheme: 'blue',
          language: 'fr',
          themeMode: 'dark'
        })
      })
      
      it('should handle partial preference updates', async () => {
        const requestData = {
          preferences: {
            colorTheme: 'green'
          }
        }
        
        const dbResponse = {
          colorTheme: 'GREEN',
          language: 'EN',
          themeMode: 'SYSTEM'
        }
        mockPrisma.userPreferences.upsert.mockResolvedValue(dbResponse)
        
        const request = createMockRequest('PATCH', requestData)
        const response = await PATCH(request)
        
        expect(response.status).toBe(200)
        expect(mockPrisma.userPreferences.upsert).toHaveBeenCalledWith({
          where: { userId: 'test_user_123' },
          create: {
            userId: 'test_user_123',
            colorTheme: 'GREEN',
            language: 'EN',
            themeMode: 'SYSTEM'
          },
          update: {
            colorTheme: 'GREEN'
          },
          select: {
            colorTheme: true,
            language: true,
            themeMode: true
          }
        })
      })
    })

    describe('Error Handling', () => {
      const mockSession = { user: { id: 'test_user_123' } }
      
      beforeEach(() => {
        mockAuth.api.getSession.mockResolvedValue(mockSession)
      })

      it('should handle database errors during update', async () => {
        const requestData = {
          preferences: { colorTheme: 'red' }
        }
        
        const dbError = new Error('Database write failed')
        mockPrisma.userPreferences.upsert.mockRejectedValue(dbError)
        
        const request = createMockRequest('PATCH', requestData)
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.INTERNAL_SERVER_ERROR)
        expect(mockLogger.apiError).toHaveBeenCalledWith(
          'PATCH /api/preferences - Error',
          { error: 'Database write failed' },
          dbError
        )
      })
      
      it('should handle malformed JSON in request body', async () => {
        // Create a request with invalid JSON
        const request = new NextRequest('http://localhost:3000/api/preferences', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: '{ invalid json'
        })
        
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.INTERNAL_SERVER_ERROR)
        expect(mockLogger.apiError).toHaveBeenCalled()
      })
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle complete user preference lifecycle', async () => {
      const userId = 'test_user_123'
      const mockSession = { user: { id: userId } }
      mockAuth.api.getSession.mockResolvedValue(mockSession)
      
      // Step 1: GET request should create default preferences
      mockPrisma.userPreferences.findUnique.mockResolvedValueOnce(null)
      mockPrisma.userPreferences.create.mockResolvedValueOnce({
        colorTheme: 'DEFAULT',
        language: 'EN',
        themeMode: 'SYSTEM'
      })
      
      const getResponse = await GET()
      expect(getResponse.status).toBe(200)
      
      const getBody = await getResponse.json()
      expect(getBody.data).toEqual({
        colorTheme: 'default',
        language: 'en',
        themeMode: 'system'
      })
      
      // Step 2: PATCH request should update preferences
      mockPrisma.userPreferences.upsert.mockResolvedValueOnce({
        colorTheme: 'BLUE',
        language: 'FR',
        themeMode: 'DARK'
      })
      
      const patchRequest = createMockRequest('PATCH', {
        preferences: {
          colorTheme: 'blue',
          language: 'fr',
          themeMode: 'dark'
        }
      })
      
      const patchResponse = await PATCH(patchRequest)
      expect(patchResponse.status).toBe(200)
      
      const patchBody = await patchResponse.json()
      expect(patchBody.data).toEqual({
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark'
      })
      
      // Step 3: Subsequent GET should return updated preferences
      mockPrisma.userPreferences.findUnique.mockResolvedValueOnce({
        colorTheme: 'BLUE',
        language: 'FR',
        themeMode: 'DARK'
      })
      
      const getResponse2 = await GET()
      expect(getResponse2.status).toBe(200)
      
      const getBody2 = await getResponse2.json()
      expect(getBody2.data).toEqual({
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark'
      })
    })

    describe('Error Handling', () => {
      it('should handle database errors during update', async () => {
        const mockSession = { user: { id: 'test_user_123' } }
        mockAuth.api.getSession.mockResolvedValue(mockSession)
        
        const dbError = new Error('Database update failed')
        mockPrisma.userPreferences.upsert.mockRejectedValue(dbError)
        
        const request = createMockRequest('PATCH', {
          preferences: { colorTheme: 'red' }
        })
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.INTERNAL_SERVER_ERROR)
        expect(mockLogger.apiError).toHaveBeenCalledWith(
          'PATCH /api/preferences - Error',
          { error: 'Database update failed' },
          dbError
        )
        
        const body = await response.json()
        expect(body).toEqual({ error: 'Internal server error' })
      })

      it('should handle malformed JSON in request body', async () => {
        const mockSession = { user: { id: 'test_user_123' } }
        mockAuth.api.getSession.mockResolvedValue(mockSession)
        
        // Create a mock request that throws when parsing JSON
        const request = {
          json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
        } as unknown as NextRequest
        
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.INTERNAL_SERVER_ERROR)
        expect(mockLogger.apiError).toHaveBeenCalledWith(
          'PATCH /api/preferences - Error',
          { error: 'Unexpected token' },
          expect.any(SyntaxError)
        )
      })

      it('should handle non-Error exceptions in GET', async () => {
        const mockSession = { user: { id: 'test_user_123' } }
        mockAuth.api.getSession.mockResolvedValue(mockSession)
        
        // Throw a non-Error object
        mockPrisma.userPreferences.findUnique.mockRejectedValue('String error')
        
        const response = await GET()
        
        expect(response.status).toBe(API.STATUS_CODES.INTERNAL_SERVER_ERROR)
        expect(mockLogger.apiError).toHaveBeenCalledWith(
          'GET /api/preferences - Error',
          { error: 'String error' },
          undefined
        )
      })

      it('should handle non-Error exceptions in PATCH', async () => {
        const mockSession = { user: { id: 'test_user_123' } }
        mockAuth.api.getSession.mockResolvedValue(mockSession)
        
        // Throw a non-Error object
        mockPrisma.userPreferences.upsert.mockRejectedValue('String error')
        
        const request = createMockRequest('PATCH', {
          preferences: { colorTheme: 'red' }
        })
        const response = await PATCH(request)
        
        expect(response.status).toBe(API.STATUS_CODES.INTERNAL_SERVER_ERROR)
        expect(mockLogger.apiError).toHaveBeenCalledWith(
          'PATCH /api/preferences - Error',
          { error: 'String error' },
          undefined
        )
      })
    })

    describe('Edge Cases', () => {
      it('should handle partial preference updates with null/undefined values', async () => {
        const mockSession = { user: { id: 'test_user_123' } }
        mockAuth.api.getSession.mockResolvedValue(mockSession)
        
        // Mock mapping function to return partial data with some null values
        const dbResponse = {
          colorTheme: 'DEFAULT',
          language: 'EN',
          themeMode: 'SYSTEM'
        }
        mockPrisma.userPreferences.upsert.mockResolvedValue(dbResponse)
        
        const request = createMockRequest('PATCH', {
          preferences: { colorTheme: 'blue' } // Only updating color theme
        })
        const response = await PATCH(request)
        
        expect(response.status).toBe(200)
        // Test the create branch with default values when some fields are null
        expect(mockPrisma.userPreferences.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            create: expect.objectContaining({
              colorTheme: 'BLUE',
              language: 'EN', // Default fallback
              themeMode: 'SYSTEM', // Default fallback
            })
          })
        )
      })
    })
  })
})