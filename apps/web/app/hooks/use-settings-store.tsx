"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import { type ColorTheme, applyTheme } from "@/lib/theme"
import { useTheme } from "next-themes"
import { getTranslation, type Language } from "@/lib/i18n"
import {
  getLocalStoragePreferences,
  saveLocalStoragePreferences,
  migrateLocalStorageToDatabase,
  DEFAULT_PREFERENCES,
} from "@/lib/preferences"
import { useUserPreferences, useUpdatePreferences } from "@/lib/queries/preferences"
import type { UserPreferences } from "@boilerplate/types"
import { useSession } from "@/lib/auth-client"
import { logger } from "@/lib/utils/logger"
import { TIMING, UI } from "@/lib/config/constants"

interface SettingsStoreContextType {
  // Theme settings
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  themeMode: 'light' | 'dark' | 'system'

  // Language settings  
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  
  // Loading state
  preferencesLoaded: boolean
}

// Create a context for the settings store
const SettingsStoreContext = createContext<SettingsStoreContextType | undefined>(undefined)

// Provider component that wraps the app and provides the settings context
export function SettingsStoreProvider({ children }: { children: React.ReactNode }) {
  // Theme settings
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const { theme, setTheme } = useTheme()

  // Language settings
  const [language, setLanguage] = useState<Language>("en")

  // Authentication state from Better Auth
  const { data: session, isPending: sessionLoading } = useSession()
  
  // Loading state
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false)
  
  // Debug logging for session changes
  useEffect(() => {
    logger.settingsDebug('Session state changed', {
      hasSession: !!session?.user,
      sessionUserId: session?.user?.id,
      sessionLoading,
      preferencesLoaded
    })
  }, [session?.user, sessionLoading, preferencesLoaded])
  
  // TanStack Query hooks for preferences
  const { 
    data: userPreferences, 
    isLoading: preferencesLoading,
    isSuccess: preferencesSuccess,
    isError: preferencesError 
  } = useUserPreferences({ enabled: !!session?.user })
  
  // Debug logging for TanStack Query state
  useEffect(() => {
    if (session?.user) {
      logger.settingsDebug('TanStack Query state for authenticated user', {
        sessionUserId: session.user.id,
        preferencesLoading,
        preferencesSuccess,
        preferencesError,
        userPreferences,
        hasUserPreferences: !!userPreferences
      })
    }
  }, [session?.user, preferencesLoading, preferencesSuccess, preferencesError, userPreferences])
  const updatePreferencesMutation = useUpdatePreferences()
  
  // Track if we've migrated localStorage to database for this session
  const hasMigratedRef = useRef<boolean>(false)
  
  // Track if we're currently updating preferences to prevent loops
  const isUpdatingRef = useRef<boolean>(false)
  
  // Unified debounce timer for all preference updates
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Keep track of pending updates to batch them
  const pendingUpdatesRef = useRef<Partial<UserPreferences>>({})

  // Translation function
  const t = (key: string) => {
    return getTranslation(language, key)
  }

  // Unified debounced update function with proper dependencies
  const debouncedUpdatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    // Prevent updates if we're already updating
    if (isUpdatingRef.current) {
      logger.settingsDebug('Skipping preference update - already updating', { updates })
      return
    }
    
    // Merge updates with pending updates
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    }

    // Clear existing timer
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }

    // Set new timer with unified debounce delay
    updateTimerRef.current = setTimeout(async () => {
      const preferencesToSave = { ...pendingUpdatesRef.current }
      pendingUpdatesRef.current = {} // Clear pending updates

      logger.settingsDebug('Saving batched preferences', { preferencesToSave })

      // Set updating flag
      isUpdatingRef.current = true

      try {
        // Check if user is authenticated at time of save
        if (session?.user) {
          try {
            logger.settingsDebug('Saving preferences to database', { preferencesToSave, userId: session.user.id })
            await updatePreferencesMutation.mutateAsync(preferencesToSave)
            logger.settingsInfo('Preferences saved to database successfully via TanStack Query')
          } catch (error) {
            logger.settingsError('Error saving preferences to database via TanStack Query', 
              { error: error instanceof Error ? error.message : String(error) },
              error instanceof Error ? error : undefined
            )
            // Fallback to localStorage
            saveLocalStoragePreferences(preferencesToSave)
          }
        } else {
          // Save to localStorage for anonymous users
          saveLocalStoragePreferences(preferencesToSave)
          logger.settingsDebug('Preferences saved to localStorage for anonymous user')
        }
      } finally {
        // Clear updating flag after a short delay to allow for cache updates
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 100)
      }
    }, TIMING.PREFERENCES_UPDATE_DEBOUNCE)
  }, [session?.user, updatePreferencesMutation]) // Include dependencies to avoid stale closures

  // Load preferences from TanStack Query or localStorage
  useEffect(() => {
    // Don't load if session is still loading
    if (sessionLoading) return
    
    if (session?.user) {
      // User is authenticated - use TanStack Query data
      if (preferencesSuccess && userPreferences) {
        logger.settingsDebug('Database preferences loaded via TanStack Query', { userPreferences })
        
        // Convert database format (uppercase) to frontend format (lowercase)
        const colorTheme = userPreferences.colorTheme?.toLowerCase() as ColorTheme || DEFAULT_PREFERENCES.colorTheme as ColorTheme
        const language = userPreferences.language?.toLowerCase() as Language || DEFAULT_PREFERENCES.language as Language
        const themeMode = userPreferences.themeMode?.toLowerCase() as UserPreferences['themeMode'] || DEFAULT_PREFERENCES.themeMode
        
        setColorTheme(colorTheme)
        setLanguage(language)
        setTheme(themeMode || DEFAULT_PREFERENCES.themeMode || 'system')
        
        setPreferencesLoaded(true)
        
        // Migrate localStorage preferences to database if not done yet
        if (!hasMigratedRef.current) {
          logger.settingsInfo('Migrating localStorage preferences to database')
          migrateLocalStorageToDatabase().then(migrationSuccess => {
            hasMigratedRef.current = migrationSuccess
          })
        }
      } else if (preferencesError || userPreferences === null) {
        logger.settingsWarn('Failed to load database preferences via TanStack Query - using defaults')
        // Use defaults on error or when userPreferences is null
        setColorTheme(DEFAULT_PREFERENCES.colorTheme as ColorTheme)
        setLanguage(DEFAULT_PREFERENCES.language as Language)
        setTheme(DEFAULT_PREFERENCES.themeMode || 'light')
        setPreferencesLoaded(true)
      }
      // If still loading, wait for TanStack Query to complete
    } else {
      // User is not authenticated, use localStorage
      logger.settingsInfo('User not authenticated - using localStorage')
      const localPreferences = getLocalStoragePreferences()
      setColorTheme((localPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme as ColorTheme)
      setLanguage((localPreferences.language as Language) || DEFAULT_PREFERENCES.language as Language)
      if (localPreferences.themeMode) {
        setTheme(localPreferences.themeMode)
      }
      // Set preferencesLoaded to true for localStorage users too
      setPreferencesLoaded(true)
    }
  }, [session, sessionLoading, preferencesSuccess, preferencesError, userPreferences, setTheme])

  // Apply theme when colorTheme or theme mode changes
  useEffect(() => {
    if (!preferencesLoaded) return
    
    try {
      // Use constant for radius value
      document.documentElement.style.setProperty("--radius", UI.DEFAULT_RADIUS)

      // Apply theme based on current mode and color theme
      // Handle system theme mode properly
      let mode: "light" | "dark"
      if (theme === "system") {
        // Check system preference
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        mode = systemPrefersDark ? "dark" : "light"
      } else {
        mode = theme === "dark" ? "dark" : "light"
      }
      
      applyTheme(colorTheme, mode)
      
      // Force next-themes to sync with our theme state
      if (theme !== "system") {
        document.documentElement.classList.remove("dark", "light")
        document.documentElement.classList.add(mode)
      }
      
      logger.settingsDebug('Applied theme', { colorTheme, themeMode: theme, mode })
    } catch (error) {
      logger.settingsError('Error applying theme', 
        { colorTheme, themeMode: theme, error: error instanceof Error ? error.message : String(error) },
        error instanceof Error ? error : undefined
      )
    }
  }, [colorTheme, theme, preferencesLoaded])

  // Listen for system theme changes when theme mode is "system"
  useEffect(() => {
    if (!preferencesLoaded || theme !== "system") return
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleSystemThemeChange = () => {
      try {
        const systemPrefersDark = mediaQuery.matches
        const mode = systemPrefersDark ? "dark" : "light"
        applyTheme(colorTheme, mode)
        
        // Update next-themes classes for system mode
        document.documentElement.classList.remove("dark", "light")
        document.documentElement.classList.add(mode)
        
        logger.settingsDebug('Applied system theme change', { colorTheme, mode })
      } catch (error) {
        logger.settingsError('Error applying system theme change', 
          { colorTheme, error: error instanceof Error ? error.message : String(error) },
          error instanceof Error ? error : undefined
        )
      }
    }
    
    mediaQuery.addEventListener("change", handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange)
    }
  }, [colorTheme, theme, preferencesLoaded])
  
  // Trigger unified debounced save when theme preferences change
  useEffect(() => {
    if (!preferencesLoaded || isUpdatingRef.current) return
    
    // Only save if values actually changed from loaded preferences
    const currentPrefs = session?.user ? userPreferences : getLocalStoragePreferences()
    
    // Convert database format for comparison
    const currentColorTheme = currentPrefs?.colorTheme?.toLowerCase() as ColorTheme
    const currentThemeMode = currentPrefs?.themeMode?.toLowerCase() as UserPreferences['themeMode']
    
    // More robust comparison to prevent false positives
    const colorThemeChanged = currentColorTheme !== colorTheme
    const themeModeChanged = currentThemeMode !== (theme as UserPreferences['themeMode'])
    
    const needsUpdate = colorThemeChanged || themeModeChanged
    
    if (!needsUpdate) {
      logger.settingsDebug('No theme preference changes detected', {
        currentColorTheme,
        colorTheme,
        currentThemeMode,
        theme,
        colorThemeChanged,
        themeModeChanged
      })
      return
    }
    
    logger.settingsDebug('Theme preferences changed, triggering update', {
      colorThemeChanged,
      themeModeChanged,
      currentColorTheme,
      colorTheme,
      currentThemeMode,
      theme
    })
    
    const preferences: Partial<UserPreferences> = {
      colorTheme,
      themeMode: theme as UserPreferences['themeMode'],
    }
    
    debouncedUpdatePreferences(preferences)
  }, [colorTheme, theme, preferencesLoaded, session?.user, userPreferences, debouncedUpdatePreferences])

  // Trigger unified debounced save when language changes
  useEffect(() => {
    if (!preferencesLoaded || isUpdatingRef.current) return
    
    // Only save if language actually changed from loaded preferences
    const currentPrefs = session?.user ? userPreferences : getLocalStoragePreferences()
    
    // Convert database format for comparison
    const currentLanguage = currentPrefs?.language?.toLowerCase() as Language
    
    const needsUpdate = currentLanguage !== language
    
    if (!needsUpdate) {
      logger.settingsDebug('No language preference changes detected', {
        currentLanguage,
        language
      })
      return
    }
    
    logger.settingsDebug('Language preference changed, triggering update', {
      currentLanguage,
      language
    })
    
    const preferences: Partial<UserPreferences> = { language }
    debouncedUpdatePreferences(preferences)
  }, [language, preferencesLoaded, session?.user, userPreferences, debouncedUpdatePreferences])

  // Cleanup effect to clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
      // Reset updating flag on unmount
      isUpdatingRef.current = false
    }
  }, [])

  return (
    <SettingsStoreContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        themeMode: (theme as 'light' | 'dark' | 'system') || 'system',
        language,
        setLanguage,
        t,
        preferencesLoaded,
      }}
    >
      {children}
    </SettingsStoreContext.Provider>
  )
}

// Hook to use the settings store
export function useSettingsStore() {
  const context = useContext(SettingsStoreContext)
  if (context === undefined) {
    throw new Error("useSettingsStore must be used within a SettingsStoreProvider")
  }
  return context
}

// Specialized hooks that use the settings store
export function useThemeSettings() {
  const { colorTheme, setColorTheme } = useSettingsStore()

  // Enhanced setter function that handles both database and localStorage
  const setColorThemeMemoized = useCallback(
    (theme: ColorTheme) => {
      setColorTheme(theme)
    },
    [setColorTheme],
  )

  // Return a memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      colorTheme,
      setColorTheme: setColorThemeMemoized,
    }),
    [colorTheme, setColorThemeMemoized],
  )
}

export function useLanguageSettings() {
  const { language, setLanguage, t } = useSettingsStore()

  // Enhanced setter function that handles both database and localStorage
  const setLanguageMemoized = useCallback(
    (lang: Language) => {
      setLanguage(lang)
    },
    [setLanguage],
  )

  // Memoize the translation function
  const tMemoized = useCallback(
    (key: string) => {
      return t(key)
    },
    [t],
  )

  // Return a memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      language,
      setLanguage: setLanguageMemoized,
      t: tMemoized,
    }),
    [language, setLanguageMemoized, tMemoized],
  )
}

// Combined hook for backward compatibility
export function useSettings() {
  const themeSettings = useThemeSettings()
  const languageSettings = useLanguageSettings()

  return useMemo(
    () => ({
      ...themeSettings,
      ...languageSettings,
    }),
    [themeSettings, languageSettings],
  )
}

// For backward compatibility
export const SettingsProvider = SettingsStoreProvider