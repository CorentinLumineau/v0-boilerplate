/**
 * Comprehensive tests for the useSettingsStore hook
 * Tests all scenarios including debouncing, localStorage, API integration, and error handling
 */

import React from 'react'
import { renderHook, act, waitFor } from '@testing-library/react'
import { 
  useSettingsStore, 
  SettingsStoreProvider,
  useThemeSettings,
  useLanguageSettings,
  useSettings
} from '@/hooks/use-settings-store'
import { TIMING } from '@/lib/config/constants'

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock dependencies
jest.mock('@/lib/auth-client', () => ({
  useSession: jest.fn()
}))

jest.mock('next-themes', () => ({
  useTheme: jest.fn()
}))

jest.mock('@/lib/theme', () => ({
  applyTheme: jest.fn()
}))

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    settingsError: jest.fn(),
    settingsWarn: jest.fn(),
    settingsInfo: jest.fn(),
    settingsDebug: jest.fn(),
    preferencesError: jest.fn(),
    preferencesWarn: jest.fn(),
    preferencesInfo: jest.fn(),
    preferencesDebug: jest.fn()
  }
}))

jest.mock('@/lib/preferences', () => ({
  fetchUserPreferences: jest.fn(),
  updateUserPreferences: jest.fn(),
  getLocalStoragePreferences: jest.fn(),
  saveLocalStoragePreferences: jest.fn(),
  migrateLocalStorageToDatabase: jest.fn(),
  DEFAULT_PREFERENCES: {
    colorTheme: 'default',
    language: 'en',
    themeMode: 'system'
  }
}))

const mockUseSession = require('@/lib/auth-client').useSession
const mockUseTheme = require('next-themes').useTheme
const mockApplyTheme = require('@/lib/theme').applyTheme
const { 
  fetchUserPreferences: mockFetchUserPreferences,
  updateUserPreferences: mockUpdateUserPreferences,
  getLocalStoragePreferences: mockGetLocalStoragePreferences,
  saveLocalStoragePreferences: mockSaveLocalStoragePreferences,
  migrateLocalStorageToDatabase: mockMigrateLocalStorageToDatabase
} = require('@/lib/preferences')

// Mock localStorage (already available from jest.setup.jsdom.js)
const mockLocalStorage = global.mockLocalStorage

// Wrapper component for testing
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsStoreProvider>{children}</SettingsStoreProvider>
)

describe('useSettingsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
    mockFetch.mockClear()
    
    // Reset default mocks
    mockUseSession.mockReturnValue({
      data: null,
      isPending: false
    })
    
    mockUseTheme.mockReturnValue({
      setTheme: jest.fn(),
      theme: 'system',
      resolvedTheme: 'light'
    })
    
    mockApplyTheme.mockImplementation(() => {})
    
    // Mock preferences functions
    mockFetchUserPreferences.mockResolvedValue(null)
    mockUpdateUserPreferences.mockResolvedValue(null)
    mockGetLocalStoragePreferences.mockReturnValue({
      colorTheme: 'default',
      language: 'en',
      themeMode: 'system'
    })
    mockSaveLocalStoragePreferences.mockImplementation(() => {})
    mockMigrateLocalStorageToDatabase.mockResolvedValue(true)
    
    // Mock localStorage methods
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'preferences') {
        return null
      }
      return null
    })
    mockLocalStorage.setItem.mockImplementation(() => {})
    mockLocalStorage.removeItem.mockImplementation(() => {})
  })

  describe('Initialization', () => {
    it('should initialize with default preferences when no session', () => {
      const { result } = renderHook(() => useSettingsStore(), { wrapper })
      
      expect(result.current.colorTheme).toBe('default')
      expect(result.current.language).toBe('en')
      expect(result.current.themeMode).toBe('system')
      expect(result.current.preferencesLoaded).toBe(false)
    })

    it('should load preferences from localStorage when no session', () => {
      // Mock the preferences function to return specific values
      mockGetLocalStoragePreferences.mockReturnValue({
        colorTheme: 'blue',
        language: 'fr',
        themeMode: 'dark'
      })

      mockUseTheme.mockReturnValue({
        setTheme: jest.fn(),
        theme: 'dark',  // Should reflect the localStorage value
        resolvedTheme: 'dark'
      })
      
      const { result } = renderHook(() => useSettingsStore(), { wrapper })
      
      expect(result.current.colorTheme).toBe('blue')
      expect(result.current.language).toBe('fr')
      expect(result.current.themeMode).toBe('dark')
    })

    it('should handle corrupted localStorage data gracefully', () => {
      mockLocalStorage.setItem('preferences', 'invalid json')
      
      const { result } = renderHook(() => useSettingsStore(), { wrapper })
      
      // Should fall back to defaults
      expect(result.current.colorTheme).toBe('default')
      expect(result.current.language).toBe('en')
      expect(result.current.themeMode).toBe('system')
    })

    it('should fetch preferences when user is authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      // Mock the theme hook to return the expected theme mode after setting
      const mockSetTheme = jest.fn()
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: 'light',  // This should reflect what's set
        resolvedTheme: 'light'
      })

      // Mock the fetchUserPreferences function
      mockFetchUserPreferences.mockResolvedValue({
        colorTheme: 'green',
        language: 'fr',
        themeMode: 'light'
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      await waitFor(() => {
        expect(result.current.preferencesLoaded).toBe(true)
      })

      expect(result.current.colorTheme).toBe('green')
      expect(result.current.language).toBe('fr')
      expect(result.current.themeMode).toBe('light')
      expect(mockFetchUserPreferences).toHaveBeenCalled()
      // Verify setTheme was called with the preference
      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })
  })

  describe('Preference Updates (Authenticated)', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      // Mock initial fetch - now using mockFetchUserPreferences
      mockFetchUserPreferences.mockResolvedValue({
        colorTheme: 'default',
        language: 'en',
        themeMode: 'system'
      })
    })

    it('should update color theme and trigger API call', async () => {
      mockUpdateUserPreferences.mockResolvedValue({
        colorTheme: 'blue',
        language: 'en',
        themeMode: 'system'
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Wait for initial load
      await waitFor(() => expect(result.current.preferencesLoaded).toBe(true))

      act(() => {
        result.current.setColorTheme('blue')
      })

      expect(result.current.colorTheme).toBe('blue')

      // Wait for debounced API call (batched with current state)
      await waitFor(() => {
        expect(mockUpdateUserPreferences).toHaveBeenCalledWith({
          colorTheme: 'blue',
          themeMode: 'system',  // Current theme mode
          language: 'en'        // Current language
        })
      }, { timeout: TIMING.PREFERENCES_UPDATE_DEBOUNCE + 100 })
    })

    it('should debounce multiple rapid updates', async () => {
      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Wait for initial load
      await waitFor(() => expect(result.current.preferencesLoaded).toBe(true))

      // Mock subsequent API calls
      mockUpdateUserPreferences.mockResolvedValue({
        colorTheme: 'purple',
        language: 'fr',
        themeMode: 'system'
      })

      // Make multiple rapid updates
      act(() => {
        result.current.setColorTheme('blue')
        result.current.setLanguage('fr')
        result.current.setColorTheme('purple') // Final value
      })

      expect(result.current.colorTheme).toBe('purple')
      expect(result.current.language).toBe('fr')

      // Wait for debounced API call - should only be called once with final values (batched)
      await waitFor(() => {
        expect(mockUpdateUserPreferences).toHaveBeenCalledWith({
          colorTheme: 'purple',
          themeMode: 'system',  // Current theme mode  
          language: 'fr'
        })
      }, { timeout: TIMING.PREFERENCES_UPDATE_DEBOUNCE + 100 })

      // Should only be called once for the debounced update (initial fetch is mockFetchUserPreferences)
      expect(mockUpdateUserPreferences).toHaveBeenCalledTimes(1)
    })

    it('should handle API errors gracefully', async () => {
      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Wait for initial load
      await waitFor(() => expect(result.current.preferencesLoaded).toBe(true))

      // Mock API error
      mockUpdateUserPreferences.mockResolvedValue(null) // Failed update

      act(() => {
        result.current.setColorTheme('red')
      })

      // Preference should still be updated locally even if API fails
      expect(result.current.colorTheme).toBe('red')

      await waitFor(() => {
        expect(mockUpdateUserPreferences).toHaveBeenCalledWith(expect.objectContaining({
          colorTheme: 'red'
        }))
      }, { timeout: TIMING.PREFERENCES_UPDATE_DEBOUNCE + 100 })
      
      // When API fails, should fallback to localStorage
      expect(mockSaveLocalStoragePreferences).toHaveBeenCalled()
    })
  })

  describe('Preference Updates (Unauthenticated)', () => {
    it('should update preferences in state only (not persisted for unauthenticated users)', async () => {
      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      act(() => {
        result.current.setColorTheme('orange')
        result.current.setLanguage('fr')
      })

      // State should be updated immediately
      expect(result.current.colorTheme).toBe('orange')
      expect(result.current.language).toBe('fr')

      // Wait to ensure no localStorage calls are made
      await new Promise(resolve => setTimeout(resolve, TIMING.PREFERENCES_UPDATE_DEBOUNCE + 100))
      
      // Should not save to localStorage for unauthenticated users (by design)
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      
      // Should not make any API calls
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage setItem to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Should not throw error
      expect(() => {
        act(() => {
          result.current.setColorTheme('teal')
        })
      }).not.toThrow()

      expect(result.current.colorTheme).toBe('teal')
    })
  })

  describe('Session State Changes', () => {
    it('should fetch preferences when user logs in', async () => {
      // Start without session
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false
      })
      
      const { result, rerender } = renderHook(() => useSettingsStore(), { wrapper })

      expect(result.current.preferencesLoaded).toBe(false)
      expect(result.current.colorTheme).toBe('default')

      // Mock theme hook to reflect the loaded preferences  
      const mockSetTheme = jest.fn()
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: 'dark',  // Should reflect the loaded theme
        resolvedTheme: 'dark'
      })

      // Mock user logging in
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      // Mock fetchUserPreferences to return the expected data
      mockFetchUserPreferences.mockResolvedValue({
        colorTheme: 'pink',
        language: 'fr',
        themeMode: 'dark'
      })

      rerender()

      await waitFor(() => {
        expect(result.current.preferencesLoaded).toBe(true)
      }, { timeout: 1000 })

      await waitFor(() => {
        expect(result.current.colorTheme).toBe('pink')
      }, { timeout: 1000 })
      
      expect(result.current.language).toBe('fr')
      expect(result.current.themeMode).toBe('dark')
      expect(mockFetchUserPreferences).toHaveBeenCalled()
      expect(mockSetTheme).toHaveBeenCalledWith('dark')
    })

    it('should reset to localStorage when user logs out', async () => {
      // Start with session
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      const mockSetTheme = jest.fn()
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: 'light',  // From API initially
        resolvedTheme: 'light'
      })

      // Mock fetchUserPreferences to return authenticated user preferences
      mockFetchUserPreferences.mockResolvedValue({
        colorTheme: 'purple',
        language: 'fr',
        themeMode: 'light'
      })

      const { result, rerender } = renderHook(() => useSettingsStore(), { wrapper })

      await waitFor(() => {
        expect(result.current.preferencesLoaded).toBe(true)
      })

      await waitFor(() => {
        expect(result.current.colorTheme).toBe('purple') // From API
      })

      // Mock user logging out - update theme mock and localStorage preferences
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false
      })

      mockGetLocalStoragePreferences.mockReturnValue({
        colorTheme: 'teal',
        language: 'en',
        themeMode: 'system'
      })

      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: 'system',  // Should revert to localStorage/default
        resolvedTheme: 'light'
      })

      rerender()

      // Should fallback to localStorage values - wait for async state updates
      await waitFor(() => {
        expect(result.current.colorTheme).toBe('teal')
      }, { timeout: 1000 })
      
      expect(result.current.language).toBe('en')
      expect(result.current.themeMode).toBe('system')
      // After logout, preferencesLoaded stays true because it was set during authenticated session
      // The hook doesn't reset it to false on logout - this is by design
      expect(result.current.preferencesLoaded).toBe(true)
    })
  })

  describe('Loading States', () => {
    it('should handle session loading state', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: true
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Should use default values while loading
      expect(result.current.colorTheme).toBe('default')
      expect(result.current.preferencesLoaded).toBe(false)
    })

    it('should handle API fetch errors during initialization', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      const mockSetTheme = jest.fn()
      mockUseTheme.mockReturnValue({
        setTheme: mockSetTheme,
        theme: 'dark',  // Should reflect localStorage value
        resolvedTheme: 'dark'
      })

      // Mock fetchUserPreferences to throw an error
      mockFetchUserPreferences.mockRejectedValue(new Error('Network error'))

      // Mock getLocalStoragePreferences to return fallback data
      mockGetLocalStoragePreferences.mockReturnValue({
        colorTheme: 'green',
        language: 'en',
        themeMode: 'dark'
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      await waitFor(() => {
        expect(result.current.preferencesLoaded).toBe(false)
      }, { timeout: 1000 })

      // Should fallback to localStorage - wait for async state updates
      await waitFor(() => {
        expect(result.current.colorTheme).toBe('green')
      }, { timeout: 1000 })
      
      expect(result.current.themeMode).toBe('dark')
    })
  })

  describe('Edge Cases', () => {
    it('should handle partial localStorage data', () => {
      // Mock getLocalStoragePreferences to return partial data
      mockGetLocalStoragePreferences.mockReturnValue({
        colorTheme: 'blue',
        language: 'en', // Default
        themeMode: 'system' // Default
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      expect(result.current.colorTheme).toBe('blue')
      expect(result.current.language).toBe('en') // Default
      expect(result.current.themeMode).toBe('system') // Default
    })

    it('should handle null localStorage data', () => {
      mockLocalStorage.setItem('preferences', 'null')

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      expect(result.current.colorTheme).toBe('default')
      expect(result.current.language).toBe('en')
      expect(result.current.themeMode).toBe('system')
    })

    it('should cancel pending API calls when component unmounts', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      mockFetchUserPreferences.mockResolvedValue({
        colorTheme: 'default',
        language: 'en',
        themeMode: 'system'
      })

      const { result, unmount } = renderHook(() => useSettingsStore(), { wrapper })

      // Wait for initial load
      await waitFor(() => expect(result.current.preferencesLoaded).toBe(true))

      act(() => {
        result.current.setColorTheme('red')
      })

      // Unmount before debounced call completes
      unmount()

      // Wait longer than debounce time
      await new Promise(resolve => setTimeout(resolve, TIMING.PREFERENCES_UPDATE_DEBOUNCE + 100))

      // updateUserPreferences should not be called for the setColorTheme since component was unmounted
      // Initial load uses fetchUserPreferences, not updateUserPreferences, so 0 calls expected
      expect(mockUpdateUserPreferences).toHaveBeenCalledTimes(0)
    })

    it('should handle translation function', () => {
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Translation function should work
      expect(result.current.t).toBeDefined()
      expect(typeof result.current.t).toBe('function')
      
      // Test translation with current language
      const translationResult = result.current.t('test.key')
      expect(typeof translationResult).toBe('string')
    })

    it('should handle database errors with non-Error objects', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Wait for initial load
      await waitFor(() => expect(result.current.preferencesLoaded).toBe(true))

      // Mock updateUserPreferences to throw non-Error object
      mockUpdateUserPreferences.mockRejectedValue('String error')

      act(() => {
        result.current.setLanguage('fr')
      })

      // Should handle string error and fallback to localStorage
      await waitFor(() => {
        expect(mockUpdateUserPreferences).toHaveBeenCalled()
        expect(mockSaveLocalStoragePreferences).toHaveBeenCalled()
      }, { timeout: TIMING.PREFERENCES_UPDATE_DEBOUNCE + 100 })
    })

    it('should save to localStorage for anonymous users when preferencesLoaded is true', async () => {
      // This test covers an edge case where an anonymous user somehow has preferencesLoaded=true
      // (e.g., from a previous authenticated session that logged out but kept the flag)
      
      // Start with authenticated session to set preferencesLoaded to true
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      mockFetchUserPreferences.mockResolvedValue({
        colorTheme: 'default',
        language: 'en',
        themeMode: 'system'
      })

      const { result, rerender } = renderHook(() => useSettingsStore(), { wrapper })

      // Wait for preferencesLoaded to be true
      await waitFor(() => {
        expect(result.current.preferencesLoaded).toBe(true)
      })

      // Now simulate user logging out but preferencesLoaded remaining true
      mockUseSession.mockReturnValue({
        data: null, // No authenticated user
        isPending: false
      })

      rerender()

      // Now try to update preferences while anonymous but with preferencesLoaded=true
      act(() => {
        result.current.setColorTheme('red')
      })

      expect(result.current.colorTheme).toBe('red')

      // Wait for debounced update to hit the anonymous user localStorage save code
      await waitFor(() => {
        expect(mockSaveLocalStoragePreferences).toHaveBeenCalledWith(
          expect.objectContaining({ colorTheme: 'red' })
        )
      }, { timeout: TIMING.PREFERENCES_UPDATE_DEBOUNCE + 100 })
    })

    it('should handle theme application errors', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { id: 'test_user_123' } },
        isPending: false
      })

      // Mock applyTheme to throw error
      const mockApplyTheme = require('@/lib/theme').applyTheme
      mockApplyTheme.mockImplementation(() => {
        throw new Error('Theme application failed')
      })

      const { result } = renderHook(() => useSettingsStore(), { wrapper })

      // Wait for initial load to complete
      await waitFor(() => expect(result.current.preferencesLoaded).toBe(true))

      // Change theme to trigger theme application
      act(() => {
        result.current.setColorTheme('blue')
      })

      // Wait for theme to be applied (and error to be caught)
      await waitFor(() => {
        expect(mockApplyTheme).toHaveBeenCalled()
      })

      // Error should be caught and logged, but not thrown
      expect(result.current.colorTheme).toBe('blue')
    })
  })

  describe('Hook Error Handling', () => {
    it('should throw error when useSettingsStore is used outside provider', () => {
      // Test hook outside provider context
      expect(() => {
        renderHook(() => useSettingsStore())
      }).toThrow('useSettingsStore must be used within a SettingsStoreProvider')
    })

    it('should throw error when useThemeSettings is used outside provider', () => {
      expect(() => {
        renderHook(() => useThemeSettings())
      }).toThrow('useSettingsStore must be used within a SettingsStoreProvider')
    })

    it('should throw error when useLanguageSettings is used outside provider', () => {
      expect(() => {
        renderHook(() => useLanguageSettings())
      }).toThrow('useSettingsStore must be used within a SettingsStoreProvider')
    })

    it('should throw error when useSettings is used outside provider', () => {
      expect(() => {
        renderHook(() => useSettings())
      }).toThrow('useSettingsStore must be used within a SettingsStoreProvider')
    })
  })

  describe('Specialized Hooks', () => {
    it('should provide theme settings through useThemeSettings', () => {
      const { result } = renderHook(() => useThemeSettings(), { wrapper })

      expect(result.current.colorTheme).toBe('default')
      expect(typeof result.current.setColorTheme).toBe('function')

      act(() => {
        result.current.setColorTheme('purple')
      })

      expect(result.current.colorTheme).toBe('purple')
    })

    it('should provide language settings through useLanguageSettings', () => {
      const { result } = renderHook(() => useLanguageSettings(), { wrapper })

      expect(result.current.language).toBe('en')
      expect(typeof result.current.setLanguage).toBe('function')
      expect(typeof result.current.t).toBe('function')

      // Test the memoized translation function (line 299)
      const translationResult = result.current.t('test.key')
      expect(typeof translationResult).toBe('string')

      act(() => {
        result.current.setLanguage('fr')
      })

      expect(result.current.language).toBe('fr')
      
      // Test translation function after language change
      const translationResultFr = result.current.t('test.key.fr')
      expect(typeof translationResultFr).toBe('string')
    })

    it('should provide combined settings through useSettings', () => {
      const { result } = renderHook(() => useSettings(), { wrapper })

      expect(result.current.colorTheme).toBe('default')
      expect(result.current.language).toBe('en')
      expect(typeof result.current.setColorTheme).toBe('function')
      expect(typeof result.current.setLanguage).toBe('function')
      expect(typeof result.current.t).toBe('function')

      act(() => {
        result.current.setColorTheme('blue')
        result.current.setLanguage('fr')
      })

      expect(result.current.colorTheme).toBe('blue')
      expect(result.current.language).toBe('fr')
    })
  })
})