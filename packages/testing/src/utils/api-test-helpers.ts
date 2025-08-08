/**
 * API testing utilities for testing Next.js API routes
 */

import { NextRequest } from 'next/server'
import { ApiTestContext, ApiTestExpectations } from '../types'

/**
 * Create a mock Next.js request object
 */
export const createMockRequest = (
  method: string,
  url: string,
  options: {
    headers?: Record<string, string>
    body?: any
    cookies?: Record<string, string>
    query?: Record<string, string>
  } = {}
): NextRequest => {
  const { headers = {}, body, cookies = {}, query = {} } = options
  
  // Create URL with query parameters
  const urlWithQuery = new URL(url, 'http://localhost:3000')
  Object.entries(query).forEach(([key, value]) => {
    urlWithQuery.searchParams.set(key, value)
  })
  
  // Create headers object
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers
  })
  
  // Add cookies to headers
  if (Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
    requestHeaders.set('Cookie', cookieString)
  }
  
  // Create request body
  const requestBody = body ? JSON.stringify(body) : null
  
  const request = new NextRequest(urlWithQuery.toString(), {
    method,
    headers: requestHeaders,
    body: requestBody
  })
  
  return request
}

/**
 * Create mock session headers for authenticated requests
 */
export const createAuthHeaders = (sessionToken: string): Record<string, string> => {
  return {
    'Authorization': `Bearer ${sessionToken}`,
    'Cookie': `session=${sessionToken}`
  }
}

/**
 * Mock the auth.api.getSession function
 */
export const mockAuthSession = (session: any = null) => {
  const mockAuth = {
    api: {
      getSession: jest.fn().mockResolvedValue(session)
    }
  }
  
  // Mock the module
  jest.doMock('@/lib/auth', () => ({
    auth: mockAuth
  }))
  
  return mockAuth
}

/**
 * Create a test context with authentication
 */
export const createTestContext = (options: ApiTestContext = {}): ApiTestContext => {
  const { userId = 'test_user_id', sessionToken = 'test_session_token', adminUser = false } = options
  
  return {
    userId,
    sessionToken,
    adminUser
  }
}

/**
 * Test an API endpoint with various scenarios
 */
export const testApiEndpoint = async (
  handler: (req: NextRequest) => Promise<Response>,
  method: string,
  path: string,
  scenarios: {
    name: string
    request?: {
      body?: any
      headers?: Record<string, string>
      query?: Record<string, string>
    }
    auth?: {
      session?: any
    }
    expectations: ApiTestExpectations
  }[]
) => {
  const results = []
  
  for (const scenario of scenarios) {
    describe(scenario.name, () => {
      let response: Response
      
      beforeAll(async () => {
        // Mock authentication if provided
        if (scenario.auth) {
          mockAuthSession(scenario.auth.session)
        }
        
        // Create request
        const request = createMockRequest(method, path, scenario.request || {})
        
        // Call handler
        response = await handler(request)
      })
      
      afterAll(() => {
        jest.clearAllMocks()
      })
      
      it(`should return status ${scenario.expectations.status}`, () => {
        expect(response.status).toBe(scenario.expectations.status)
      })
      
      if (scenario.expectations.body) {
        it('should return expected body', async () => {
          const body = await response.json()
          expect(body).toMatchObject(scenario.expectations.body)
        })
      }
      
      if (scenario.expectations.headers) {
        it('should return expected headers', () => {
          Object.entries(scenario.expectations.headers || {}).forEach(([key, value]) => {
            expect(response.headers.get(key)).toBe(value)
          })
        })
      }
    })
    
    // Note: response is not available in this scope, but we can still track the scenario
    results.push({ scenario: scenario.name })
  }
  
  return results
}

/**
 * Mock Prisma client for API testing
 */
export const mockPrisma = () => {
  const mockUser = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn()
  }
  
  const mockUserPreferences = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn()
  }
  
  const mockNotification = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn()
  }
  
  const prisma = {
    user: mockUser,
    userPreferences: mockUserPreferences,
    notification: mockNotification,
    $disconnect: jest.fn()
  }
  
  // Mock the module
  jest.doMock('@/lib/prisma', () => ({
    prisma
  }))
  
  return {
    prisma,
    mockUser,
    mockUserPreferences,
    mockNotification
  }
}

/**
 * Create mock database records
 */
export const createMockDatabaseRecords = () => {
  const users = new Map()
  const preferences = new Map()
  const notifications = new Map()
  
  return {
    users: {
      create: (data: any) => {
        const id = data.id || `user_${Date.now()}`
        const user = { id, ...data, createdAt: new Date(), updatedAt: new Date() }
        users.set(id, user)
        return user
      },
      findById: (id: string) => users.get(id),
      update: (id: string, data: any) => {
        const user = users.get(id)
        if (user) {
          const updated = { ...user, ...data, updatedAt: new Date() }
          users.set(id, updated)
          return updated
        }
        return null
      },
      delete: (id: string) => users.delete(id),
      clear: () => users.clear()
    },
    preferences: {
      create: (data: any) => {
        const id = data.id || `pref_${Date.now()}`
        const pref = { id, ...data, createdAt: new Date(), updatedAt: new Date() }
        preferences.set(id, pref)
        return pref
      },
      findByUserId: (userId: string) => {
        return Array.from(preferences.values()).find(p => p.userId === userId)
      },
      update: (id: string, data: any) => {
        const pref = preferences.get(id)
        if (pref) {
          const updated = { ...pref, ...data, updatedAt: new Date() }
          preferences.set(id, updated)
          return updated
        }
        return null
      },
      clear: () => preferences.clear()
    },
    notifications: {
      create: (data: any) => {
        const id = data.id || `notif_${Date.now()}`
        const notif = { id, ...data, createdAt: new Date(), updatedAt: new Date() }
        notifications.set(id, notif)
        return notif
      },
      findByUserId: (userId: string) => {
        return Array.from(notifications.values()).filter(n => n.userId === userId)
      },
      clear: () => notifications.clear()
    },
    clearAll: () => {
      users.clear()
      preferences.clear()
      notifications.clear()
    }
  }
}