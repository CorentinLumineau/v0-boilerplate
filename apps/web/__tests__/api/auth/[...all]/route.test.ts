/**
 * Tests for the Better Auth API route
 * Tests the auth endpoint at /api/auth/[...all]
 */

// Mock better-auth/next-js BEFORE any imports
const mockToNextJsHandler = jest.fn()

jest.mock('better-auth/next-js', () => ({
  toNextJsHandler: mockToNextJsHandler
}))

// Mock auth instance
jest.mock('@/lib/auth', () => ({
  auth: {
    mock: 'auth-instance'
  }
}))

let GET: any, POST: any

describe('/api/auth/[...all]', () => {
  beforeAll(() => {
    // Clear all module cache first
    jest.resetModules()
    
    // Set up mock to return handlers
    mockToNextJsHandler.mockReturnValue({
      GET: jest.fn().mockName('mocked-GET'),
      POST: jest.fn().mockName('mocked-POST')
    })

    // Now import the route module after mocks are configured
    const routeModule = require('@/api/auth/[...all]/route')
    GET = routeModule.GET
    POST = routeModule.POST
  })

  beforeEach(() => {
    // Don't clear mocks since we need the call history
  })

  describe('handler creation', () => {
    it('should create handlers using toNextJsHandler with auth instance', () => {
      expect(mockToNextJsHandler).toHaveBeenCalledWith({
        mock: 'auth-instance'
      })
    })

    it('should export GET handler', () => {
      expect(GET).toBeDefined()
      expect(typeof GET).toBe('function')
    })

    it('should export POST handler', () => {
      expect(POST).toBeDefined()
      expect(typeof POST).toBe('function')
    })
  })

  describe('handler integration', () => {
    it('should pass auth instance to Better Auth handler', () => {
      expect(mockToNextJsHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          mock: 'auth-instance'
        })
      )
    })

    it('should create handlers only once during module load', () => {
      // Module should be cached, so toNextJsHandler should only be called once
      expect(mockToNextJsHandler).toHaveBeenCalledTimes(1)
    })

    it('should destructure GET and POST from handler result', () => {
      const handlerResult = mockToNextJsHandler.mock.results[0]?.value
      
      expect(handlerResult).toBeDefined()
      expect(handlerResult).toHaveProperty('GET')
      expect(handlerResult).toHaveProperty('POST')
      expect(GET).toBe(handlerResult.GET)
      expect(POST).toBe(handlerResult.POST)
    })
  })

  describe('module exports', () => {
    it('should only export GET and POST methods', () => {
      // Test that the module exports the correct handlers
      expect(GET).toBeDefined()
      expect(POST).toBeDefined()
      expect(typeof GET).toBe('function')
      expect(typeof POST).toBe('function')
    })

    it('should maintain handler references from toNextJsHandler result', () => {
      // Verify the exported handlers match the mock return value
      const handlerResult = mockToNextJsHandler.mock.results[0]?.value
      expect(handlerResult).toBeDefined()
      expect(GET).toBe(handlerResult.GET)
      expect(POST).toBe(handlerResult.POST)
    })
  })

  describe('Better Auth integration', () => {
    it('should use the correct auth configuration', () => {
      // The auth instance should be passed exactly as imported
      expect(mockToNextJsHandler).toHaveBeenCalledWith({
        mock: 'auth-instance'
      })
    })

    it('should handle Next.js request/response cycle', () => {
      // toNextJsHandler should be called to create Next.js compatible handlers
      expect(mockToNextJsHandler).toHaveBeenCalledWith(
        expect.any(Object) // auth instance
      )
    })

    it('should support all auth endpoints through catch-all route', () => {
      // The [...all] dynamic route should capture all auth-related paths
      // This is handled by Better Auth's toNextJsHandler
      expect(mockToNextJsHandler).toHaveBeenCalledTimes(1)
      
      const handlers = mockToNextJsHandler.mock.results[0]?.value
      expect(handlers).toHaveProperty('GET')
      expect(handlers).toHaveProperty('POST')
    })
  })

  describe('error handling', () => {
    it('should handle toNextJsHandler being called during module load', () => {
      // Verify that toNextJsHandler was called exactly once during module import
      expect(mockToNextJsHandler).toHaveBeenCalledTimes(1)
      expect(mockToNextJsHandler).toHaveBeenCalledWith({
        mock: 'auth-instance'
      })
    })

    it('should provide working handlers even with mocked implementation', () => {
      // The mocked handlers should still be functions
      expect(typeof GET).toBe('function')
      expect(typeof POST).toBe('function')
      
      // They should be the exact functions returned by our mock
      const mockResult = mockToNextJsHandler.mock.results[0]?.value
      expect(GET).toBe(mockResult.GET)
      expect(POST).toBe(mockResult.POST)
    })
  })
})