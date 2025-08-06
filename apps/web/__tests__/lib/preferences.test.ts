/**
 * Comprehensive tests for the preferences library
 * Tests the actual preferences service functions
 */

import {
  DEFAULT_PREFERENCES,
  fetchUserPreferences,
  updateUserPreferences,
  getLocalStoragePreferences,
  saveLocalStoragePreferences,
  migrateLocalStorageToDatabase
} from '@/lib/preferences'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock localStorage (available from jest.setup.jsdom.js)
const mockLocalStorage = global.mockLocalStorage

describe('preferences library', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
    mockLocalStorage.clear()
    
    // Clear the mock function call history
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
  })

  describe('DEFAULT_PREFERENCES', () => {
    it('should have proper default values', () => {
      expect(DEFAULT_PREFERENCES).toEqual({
        colorTheme: 'default',
        language: 'en',
        themeMode: 'system'
      })
    })

    it('should be a readonly object', () => {
      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        DEFAULT_PREFERENCES.colorTheme = 'blue'
      }).toThrow()
    })
  })

  describe('fetchUserPreferences', () => {
    it('should fetch preferences successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            colorTheme: 'blue',
            language: 'fr',
            themeMode: 'dark'
          }
        })
      })

      const result = await fetchUserPreferences()

      expect(result).toEqual({
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark'
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/preferences', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        signal: expect.objectContaining({
          aborted: expect.any(Boolean),
          addEventListener: expect.any(Function),
          removeEventListener: expect.any(Function)
        })
      })
    })

    it('should return null on 401 authentication error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      const result = await fetchUserPreferences()

      expect(result).toBeNull()
    })

    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await fetchUserPreferences()

      expect(result).toBeNull()
    })

    it('should handle timeout errors', async () => {
      // Mock fetch to reject with AbortError
      const abortError = new Error('The operation was aborted.')
      abortError.name = 'AbortError'
      
      mockFetch.mockImplementationOnce(() => 
        Promise.reject(abortError)
      )

      const result = await fetchUserPreferences()

      expect(result).toBeNull()
    })

    it('should return default preferences when API returns no data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: null })
      })

      const result = await fetchUserPreferences()

      expect(result).toEqual(DEFAULT_PREFERENCES)
    })

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const result = await fetchUserPreferences()

      expect(result).toBeNull()
    })
  })

  describe('updateUserPreferences', () => {
    it('should update preferences successfully', async () => {
      const updatedPrefs = {
        colorTheme: 'green' as const,
        themeMode: 'light' as const
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            colorTheme: 'green',
            language: 'en',
            themeMode: 'light'
          }
        })
      })

      const result = await updateUserPreferences(updatedPrefs)

      expect(result).toEqual({
        colorTheme: 'green',
        language: 'en',
        themeMode: 'light'
      })
      expect(mockFetch).toHaveBeenCalledWith('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences: updatedPrefs }),
        signal: expect.objectContaining({
          aborted: expect.any(Boolean),
          addEventListener: expect.any(Function),
          removeEventListener: expect.any(Function)
        })
      })
    })

    it('should return null on authentication error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      const result = await updateUserPreferences({ colorTheme: 'blue' })

      expect(result).toBeNull()
    })

    it('should retry on server errors', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          text: () => Promise.resolve('Server Error')
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          text: () => Promise.resolve('Server Error')
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            data: {
              colorTheme: 'purple',
              language: 'en',
              themeMode: 'system'
            }
          })
        })

      const result = await updateUserPreferences({ colorTheme: 'purple' })

      expect(result).toEqual({
        colorTheme: 'purple',
        language: 'en',
        themeMode: 'system'
      })
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should not retry on client errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Bad Request')
      })

      const result = await updateUserPreferences({ colorTheme: 'invalid' as any })

      expect(result).toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(1) // No retries
    })

    it('should handle timeout errors', async () => {
      // Mock fetch to reject with AbortError
      const abortError = new Error('The operation was aborted.')
      abortError.name = 'AbortError'
      
      mockFetch.mockImplementationOnce(() =>
        Promise.reject(abortError)
      )

      const result = await updateUserPreferences({ colorTheme: 'red' })

      expect(result).toBeNull()
    })
  })

  describe('getLocalStoragePreferences', () => {
    it('should return preferences from localStorage', () => {
      mockLocalStorage.setItem('colorTheme', 'blue')
      mockLocalStorage.setItem('language', 'fr')
      mockLocalStorage.setItem('themeMode', 'dark')

      const result = getLocalStoragePreferences()

      expect(result).toEqual({
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark'
      })
    })

    it('should return defaults for invalid localStorage values', () => {
      mockLocalStorage.setItem('colorTheme', 'invalid')
      mockLocalStorage.setItem('language', 'invalid')
      mockLocalStorage.setItem('themeMode', 'invalid')

      const result = getLocalStoragePreferences()

      expect(result).toEqual(DEFAULT_PREFERENCES)
    })

    it('should handle partial localStorage data', () => {
      mockLocalStorage.setItem('colorTheme', 'red')
      // language and themeMode missing

      const result = getLocalStoragePreferences()

      expect(result).toEqual({
        colorTheme: 'red',
        language: 'en', // default
        themeMode: 'system' // default
      })
    })

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error')
      })

      const result = getLocalStoragePreferences()

      expect(result).toEqual(DEFAULT_PREFERENCES)
    })

    it('should return defaults in SSR context', () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR
      delete global.window

      const result = getLocalStoragePreferences()

      expect(result).toEqual(DEFAULT_PREFERENCES)

      global.window = originalWindow
    })
  })

  describe('saveLocalStoragePreferences', () => {
    it('should save valid preferences to localStorage', () => {
      saveLocalStoragePreferences({
        colorTheme: 'teal',
        language: 'fr',
        themeMode: 'light'
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('colorTheme', 'teal')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'fr')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'light')
    })

    it('should not save invalid values', () => {
      saveLocalStoragePreferences({
        colorTheme: 'invalid' as any,
        language: 'invalid' as any,
        themeMode: 'invalid' as any
      })

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should save partial preferences', () => {
      saveLocalStoragePreferences({
        colorTheme: 'pink'
      })

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('colorTheme', 'pink')
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1)
    })

    it('should handle localStorage quota exceeded error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        const error = new Error('localStorage quota exceeded')
        error.name = 'QuotaExceededError'
        throw error
      })

      expect(() => {
        saveLocalStoragePreferences({ colorTheme: 'orange' })
      }).not.toThrow()
    })

    it('should handle other localStorage errors', () => {
      const originalSetItem = mockLocalStorage.setItem
      
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Generic localStorage error')
      })

      expect(() => {
        saveLocalStoragePreferences({ colorTheme: 'orange' })
      }).not.toThrow()
      
      // Restore original implementation
      mockLocalStorage.setItem.mockImplementation(originalSetItem)
    })

    it('should skip saving in SSR context', () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR
      delete global.window

      saveLocalStoragePreferences({ colorTheme: 'blue' })

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()

      global.window = originalWindow
    })
  })

  describe('migrateLocalStorageToDatabase', () => {
    beforeEach(() => {
      // Clear all previous mock implementations
      jest.clearAllMocks()
      mockFetch.mockClear()
      mockLocalStorage.clear()
      
      // Reset mocks to default behavior
      mockLocalStorage.getItem.mockImplementation((key) => {
        const storage = {
          'colorTheme': 'purple',
          'language': 'fr', 
          'themeMode': 'dark'
        }
        return storage[key] || null
      })
      mockLocalStorage.setItem.mockImplementation(() => {})
      mockLocalStorage.removeItem.mockImplementation(() => {})
    })

    it('should migrate localStorage preferences to database', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            colorTheme: 'purple',
            language: 'fr',
            themeMode: 'dark'
          }
        })
      })

      const result = await migrateLocalStorageToDatabase()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferences: {
            colorTheme: 'purple',
            language: 'fr',
            themeMode: 'dark'
          }
        }),
        signal: expect.objectContaining({
          aborted: expect.any(Boolean),
          addEventListener: expect.any(Function),
          removeEventListener: expect.any(Function)
        })
      })
      
      // Should clear localStorage after successful migration
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('colorTheme')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('language')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('themeMode')
    })

    it('should not migrate if preferences are defaults', async () => {
      // Override the default setup with default values
      mockLocalStorage.getItem.mockImplementation((key) => {
        const defaultStorage = {
          'colorTheme': 'default',
          'language': 'en', 
          'themeMode': 'system'
        }
        return defaultStorage[key] || null
      })

      const result = await migrateLocalStorageToDatabase()

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle migration failure gracefully', async () => {
      // Setup localStorage with non-default preferences that would trigger migration
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'colorTheme') return 'blue'
        if (key === 'language') return 'en'
        if (key === 'themeMode') return 'system'
        return null
      })

      // Mock persistent failures to trigger maximum retry attempts
      mockFetch.mockRejectedValue(new Error('Server Error'))

      const result = await migrateLocalStorageToDatabase()

      expect(result).toBe(false)
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    }, 10000)

    it('should handle localStorage clear errors after successful migration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            colorTheme: 'purple',
            language: 'fr',
            themeMode: 'dark'
          }
        })
      })

      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Failed to clear localStorage')
      })

      const result = await migrateLocalStorageToDatabase()

      expect(result).toBe(true) // Migration still successful
    })

    it('should return false in SSR context', async () => {
      const originalWindow = global.window
      // @ts-expect-error - Testing SSR
      delete global.window

      const result = await migrateLocalStorageToDatabase()

      expect(result).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()

      global.window = originalWindow
    })

    it('should only migrate non-default preferences', async () => {
      // Set mixed preferences (some default, some custom)
      mockLocalStorage.getItem.mockImplementation((key) => {
        const mixedStorage = {
          'colorTheme': 'blue', // custom
          'language': 'en', // default 
          'themeMode': 'dark' // custom
        }
        return mixedStorage[key] || null
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: {
            colorTheme: 'blue',
            language: 'en',
            themeMode: 'dark'
          }
        })
      })

      const result = await migrateLocalStorageToDatabase()

      expect(result).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          preferences: {
            colorTheme: 'blue',
            themeMode: 'dark'
            // language not included because it's default
          }
        }),
        signal: expect.objectContaining({
          aborted: expect.any(Boolean),
          addEventListener: expect.any(Function),
          removeEventListener: expect.any(Function)
        })
      })
    })
  })

  describe('Integration Tests', () => {
    beforeEach(() => {
      // Clear and reset mocks for integration tests
      jest.clearAllMocks()
      mockFetch.mockClear()
      mockLocalStorage.clear()
    })

    it('should handle complete preference workflow', async () => {
      // 1. Set up localStorage with specific preferences
      mockLocalStorage.getItem.mockImplementation((key) => {
        const storage = {
          'colorTheme': 'green',
          'language': 'fr',
          'themeMode': 'system'
        }
        return storage[key] || null
      })
      
      const localPrefs = getLocalStoragePreferences()
      expect(localPrefs.colorTheme).toBe('green')
      expect(localPrefs.language).toBe('fr')

      // 2. Update preferences via API
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { colorTheme: 'blue', language: 'fr', themeMode: 'dark' }
        })
      })

      const updateResult = await updateUserPreferences({ colorTheme: 'blue', themeMode: 'dark' })
      expect(updateResult).toEqual({
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark'
      })

      // 3. Fetch updated preferences
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: { colorTheme: 'blue', language: 'fr', themeMode: 'dark' }
        })
      })

      const fetchResult = await fetchUserPreferences()
      expect(fetchResult).toEqual({
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark'
      })
    })

    it('should gracefully fallback to localStorage when API fails', async () => {
      // Set up localStorage with specific preferences
      mockLocalStorage.getItem.mockImplementation((key) => {
        const storage = {
          'colorTheme': 'pink',
          'language': 'en',
          'themeMode': 'light'
        }
        return storage[key] || null
      })

      // API fetch fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        text: () => Promise.resolve('Server Error')
      })

      const apiResult = await fetchUserPreferences()
      expect(apiResult).toBeNull()

      // Fallback to localStorage
      const localResult = getLocalStoragePreferences()
      expect(localResult.colorTheme).toBe('pink')
      expect(localResult.themeMode).toBe('light')
      expect(localResult.language).toBe('en') // default
    })
  })

  describe('Type Safety', () => {
    it('should enforce proper preference types', () => {
      const preferences = {
        colorTheme: 'blue' as const,
        language: 'fr' as const,
        themeMode: 'dark' as const
      }

      saveLocalStoragePreferences(preferences)
      
      // Verify all three calls were made
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('colorTheme', 'blue')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('language', 'fr')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('themeMode', 'dark')
    })

    it('should handle partial preference updates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          data: DEFAULT_PREFERENCES
        })
      })

      // Should accept partial preferences
      const result = await updateUserPreferences({
        colorTheme: 'teal'
      })

      expect(result).toEqual(DEFAULT_PREFERENCES)
      expect(mockFetch).toHaveBeenCalledWith('/api/preferences', expect.objectContaining({
        body: JSON.stringify({ preferences: { colorTheme: 'teal' } })
      }))
    })
  })
})