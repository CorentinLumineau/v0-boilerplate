/**
 * Jest setup for Node.js environment (API tests)
 */

// Setup Web APIs for Node.js environment
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock fetch with a simple implementation for Node.js
global.fetch = jest.fn()

// Mock localStorage for Node.js environment  
const createLocalStorageMock = () => {
  const store = new Map()
  
  return {
    store,
    getItem: jest.fn((key) => store.get(key) || null),
    setItem: jest.fn((key, value) => store.set(key, String(value))),
    removeItem: jest.fn((key) => store.delete(key)),
    clear: jest.fn(() => store.clear()),
    key: jest.fn((index) => Array.from(store.keys())[index] || null),
    get length() { return store.size }
  }
}

const mockLocalStorage = createLocalStorageMock()

global.localStorage = mockLocalStorage
global.mockLocalStorage = mockLocalStorage

// Mock window object for localStorage tests
global.window = {
  localStorage: mockLocalStorage,
}

// Mock Headers constructor with proper methods
class MockHeaders extends Map {
  constructor(init) {
    super()
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.set(key, value))
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this.set(key, value))
      }
    }
  }
  append(name, value) { this.set(name, value) }
  delete(name) { super.delete(name.toLowerCase()) }
  get(name) { return super.get(name.toLowerCase()) }
  has(name) { return super.has(name.toLowerCase()) }
  set(name, value) { super.set(name.toLowerCase(), String(value)) }
}

global.Headers = MockHeaders

// Mock Request
global.Request = jest.fn()

// Mock Response with proper json method
class MockResponse {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new MockHeaders(init.headers)
    this.ok = this.status >= 200 && this.status < 300
  }

  json() {
    return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body)
  }

  text() {
    return Promise.resolve(typeof this.body === 'string' ? this.body : JSON.stringify(this.body))
  }

  static json(data, init) {
    return new MockResponse(data, init)
  }
}

global.Response = MockResponse

// Mock AbortController
global.AbortController = jest.fn(function() {
  this.signal = {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }
  this.abort = jest.fn(() => {
    this.signal.aborted = true
  })
  return this
})

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  class MockNextRequest {
    constructor(url, init = {}) {
      this.url = url
      this.method = init.method || 'GET'
      this.headers = new MockHeaders(init.headers)
      this.body = init.body || null
      this._bodyUsed = false
    }

    async json() {
      if (this._bodyUsed) {
        throw new Error('Body already read')
      }
      this._bodyUsed = true
      return JSON.parse(this.body || '{}')
    }

    async text() {
      if (this._bodyUsed) {
        throw new Error('Body already read')
      }
      this._bodyUsed = true
      return this.body || ''
    }
  }

  class MockNextResponse extends MockResponse {
    static json(data, init) {
      return new MockNextResponse(data, init)
    }
  }
  
  // Expose MockResponse and MockHeaders to be used in mocks
  global.MockResponse = MockResponse
  global.MockHeaders = MockHeaders

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse,
  }
})

// Mock next/headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve(new MockHeaders())),
}))

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}))

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    userPreferences: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}))

// Mock logger  
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    settingsError: jest.fn(),
    settingsWarn: jest.fn(),
    settingsInfo: jest.fn(),
    settingsDebug: jest.fn(),
    apiError: jest.fn(),
    apiWarn: jest.fn(),
    apiInfo: jest.fn(),
    apiDebug: jest.fn(),
    preferencesError: jest.fn(),
    preferencesWarn: jest.fn(),
    preferencesInfo: jest.fn(),
    preferencesDebug: jest.fn(),
  },
}))

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}