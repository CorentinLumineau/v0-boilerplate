/**
 * General-purpose test utilities and helpers
 */

import { act } from '@testing-library/react'

/**
 * Wait for specified amount of time (useful for debounced functions)
 */
export const waitForMs = (ms: number): Promise<void> => {
  return act(async () => {
    return new Promise(resolve => setTimeout(resolve, ms))
  })
}

/**
 * Mock setTimeout for testing debounced functions
 */
export const mockTimers = {
  setup: () => {
    jest.useFakeTimers()
  },
  
  cleanup: () => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  },
  
  advanceBy: (ms: number) => {
    act(() => {
      jest.advanceTimersByTime(ms)
    })
  },
  
  runAllTimers: () => {
    act(() => {
      jest.runAllTimers()
    })
  }
}

/**
 * Create a mock function with helpful utilities
 */
export const createMockFn = <T extends (...args: any[]) => any>(
  implementation?: T
): jest.MockedFunction<T> => {
  const mockFn = jest.fn(implementation) as jest.MockedFunction<T>
  
  // Add helpful methods
  (mockFn as any).wasCalledWith = (...args: Parameters<T>) => {
    return mockFn.mock.calls.some(call => 
      call.length === args.length && 
      call.every((arg, index) => arg === args[index])
    )
  }
  
  (mockFn as any).wasLastCalledWith = (...args: Parameters<T>) => {
    const lastCall = mockFn.mock.calls[mockFn.mock.calls.length - 1]
    return lastCall && 
           lastCall.length === args.length && 
           lastCall.every((arg, index) => arg === args[index])
  }
  
  (mockFn as any).callCount = () => mockFn.mock.calls.length
  
  return mockFn
}

/**
 * Mock localStorage for testing
 */
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  const localStorage = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
    get length() { return Object.keys(store).length }
  }
  
  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    writable: true
  })
  
  return {
    localStorage,
    getStore: () => ({ ...store }),
    clearStore: () => {
      Object.keys(store).forEach(key => delete store[key])
    }
  }
}

/**
 * Mock fetch for API testing
 */
export interface MockFetchResponse {
  ok?: boolean
  status?: number
  statusText?: string
  json?: () => Promise<any>
  text?: () => Promise<string>
}

export const mockFetch = (responses: MockFetchResponse[] | MockFetchResponse) => {
  const responseArray = Array.isArray(responses) ? responses : [responses]
  let callIndex = 0
  
  const fetch = jest.fn(() => {
    const response = responseArray[callIndex] || responseArray[responseArray.length - 1]
    callIndex++
    
    return Promise.resolve({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      statusText: response.statusText ?? 'OK',
      json: response.json ? jest.fn(() => Promise.resolve(response.json!())) : jest.fn(),
      text: response.text ? jest.fn(() => Promise.resolve(response.text!())) : jest.fn(),
      headers: new Headers(),
      body: null,
      bodyUsed: false,
      arrayBuffer: jest.fn(),
      blob: jest.fn(),
      formData: jest.fn(),
      clone: jest.fn(),
      redirect: jest.fn(),
      type: 'basic' as ResponseType,
      url: ''
    } as Response)
  })
  
  global.fetch = fetch
  return fetch
}

/**
 * Create a mock console for testing logging
 */
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  const mockMethods = {
    log: jest.fn(),
    info: jest.fn(), 
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
  
  Object.assign(console, mockMethods)
  
  return {
    ...mockMethods,
    restore: () => {
      Object.assign(console, originalConsole)
    },
    getCalls: (method: keyof typeof mockMethods) => mockMethods[method].mock.calls
  }
}

/**
 * Wait for a condition to be true
 */
export const waitForCondition = async (
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> => {
  const start = Date.now()
  
  while (!condition() && (Date.now() - start) < timeout) {
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  if (!condition()) {
    throw new Error(`Condition not met within ${timeout}ms`)
  }
}

/**
 * Generate test data with incremental IDs
 */
export const createTestIdGenerator = (prefix = 'test') => {
  let counter = 0
  return () => `${prefix}_${++counter}`
}

/**
 * Suppress console output during tests
 */
export const suppressConsole = () => {
  const originalMethods = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  }
  
  console.log = jest.fn()
  console.info = jest.fn()
  console.warn = jest.fn()
  console.error = jest.fn()
  console.debug = jest.fn()
  
  return () => {
    Object.assign(console, originalMethods)
  }
}