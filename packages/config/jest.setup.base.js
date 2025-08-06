/**
 * Base Jest setup for both Node and JSDOM environments
 * Contains shared mocks and utilities
 */

// Mock fetch with a simple implementation
global.fetch = jest.fn()

// Shared localStorage mock factory
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

// Make localStorage mock available globally
global.createLocalStorageMock = createLocalStorageMock

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

// Shared logger mock
const createLoggerMock = () => ({
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
})

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: createLoggerMock(),
}))

// Mock auth
jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn(),
    },
  },
}))

// Mock prisma client
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

// Suppress console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}