/**
 * Jest setup for JSDOM environment (component and hook tests)
 */

require('@testing-library/jest-dom')

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/'),
}))

jest.mock('next/headers', () => ({
  headers: jest.fn(() => Promise.resolve(new Headers())),
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'system',
    setTheme: jest.fn(),
    resolvedTheme: 'light',
    systemTheme: 'light',
  })),
  ThemeProvider: ({ children }) => children,
}))

// Mock auth client
jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn(() => ({
    data: null,
    isPending: false,
  })),
  signOut: jest.fn(),
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

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    settingsError: jest.fn(),
    settingsWarn: jest.fn(),
    settingsInfo: jest.fn(),
    settingsDebug: jest.fn(),
    preferencesError: jest.fn(),
    preferencesWarn: jest.fn(),
    preferencesInfo: jest.fn(),
    preferencesDebug: jest.fn(),
  },
}))

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString()
    }),
    removeItem: jest.fn(key => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: jest.fn(index => Object.keys(store)[index] || null),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Make localStorage available to tests
global.mockLocalStorage = localStorageMock

// Mock fetch for component tests
global.fetch = jest.fn()

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}