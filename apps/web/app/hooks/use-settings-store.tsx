"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react"
import { type ColorTheme, applyTheme } from "@/lib/theme"
import { useTheme } from "next-themes"
import { getTranslation, type Language } from "@/lib/i18n"
import {
  fetchUserPreferences,
  updateUserPreferences,
  getLocalStoragePreferences,
  saveLocalStoragePreferences,
  migrateLocalStorageToDatabase,
  DEFAULT_PREFERENCES,
} from "@/lib/preferences"
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
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false)
  
  // Track if we've migrated localStorage to database for this session
  const hasMigratedRef = useRef<boolean>(false)
  
  // Unified debounce timer for all preference updates
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Keep track of pending updates to batch them
  const pendingUpdatesRef = useRef<Partial<UserPreferences>>({})

  // Translation function
  const t = (key: string) => {
    return getTranslation(language, key)
  }

  // Unified debounced update function
  const debouncedUpdatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    if (!preferencesLoaded) return

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

      if (session?.user) {
        try {
          const result = await updateUserPreferences(preferencesToSave)
          if (result) {
            logger.settingsInfo('Preferences saved to database successfully')
          } else {
            logger.settingsWarn('Failed to save preferences to database - falling back to localStorage')
            saveLocalStoragePreferences(preferencesToSave)
          }
        } catch (error) {
          logger.settingsError('Error saving preferences to database', 
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
    }, TIMING.PREFERENCES_UPDATE_DEBOUNCE)
  }, [session, preferencesLoaded])

  // Load preferences based on authentication status
  useEffect(() => {
    // Don't load if session is still loading
    if (sessionLoading) return
    
    const loadPreferences = async () => {
      try {
        if (session?.user) {
          // User is authenticated
          logger.settingsInfo('User authenticated - loading preferences from database', { userId: session.user.id })
          
          // Try to fetch from database
          const userPreferences = await fetchUserPreferences()
          
          if (userPreferences) {
            logger.settingsDebug('Database preferences loaded', { userPreferences })
            setColorTheme((userPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme as ColorTheme)
            setLanguage((userPreferences.language as Language) || DEFAULT_PREFERENCES.language!)
            
            // Set theme mode from preferences
            if (userPreferences.themeMode) {
              setTheme(userPreferences.themeMode)
            }
          } else {
            logger.settingsInfo('No database preferences found - using defaults')
            // No preferences in database yet, use defaults
            setColorTheme(DEFAULT_PREFERENCES.colorTheme as ColorTheme)
            setLanguage(DEFAULT_PREFERENCES.language as Language)
            if (DEFAULT_PREFERENCES.themeMode) {
              setTheme(DEFAULT_PREFERENCES.themeMode)
            }
          }
          
          // Migrate localStorage preferences to database if not done yet
          if (!hasMigratedRef.current) {
            logger.settingsInfo('Migrating localStorage preferences to database')
            const migrationSuccess = await migrateLocalStorageToDatabase()
            hasMigratedRef.current = migrationSuccess
          }
        } else {
          // User is not authenticated, use localStorage
          logger.settingsInfo('User not authenticated - using localStorage')
          const localPreferences = getLocalStoragePreferences()
          setColorTheme((localPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme as ColorTheme)
          setLanguage((localPreferences.language as Language) || DEFAULT_PREFERENCES.language as Language)
          if (localPreferences.themeMode) {
            setTheme(localPreferences.themeMode)
          }
          // Don't set preferencesLoaded to true when not authenticated
          // This indicates we're using localStorage/defaults, not loaded from database
        }
      } catch (error) {
        logger.settingsError('Error loading preferences', 
          { error: error instanceof Error ? error.message : String(error) },
          error instanceof Error ? error : undefined
        )
        // Fallback to localStorage
        const localPreferences = getLocalStoragePreferences()
        setColorTheme((localPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme as ColorTheme)
        setLanguage((localPreferences.language as Language) || DEFAULT_PREFERENCES.language as Language)
        if (localPreferences.themeMode) {
          setTheme(localPreferences.themeMode)
        }
      } finally {
        // Only set preferences loaded to true if we had a session (were trying to load from DB)
        if (session?.user) {
          setPreferencesLoaded(true)
        }
      }
    }

    loadPreferences()
  }, [session, sessionLoading, setTheme])

  // Apply theme when colorTheme or theme mode changes
  useEffect(() => {
    if (!preferencesLoaded) return
    
    try {
      // Use constant for radius value
      document.documentElement.style.setProperty("--radius", UI.DEFAULT_RADIUS)

      // Apply theme based on current mode and color theme
      const mode = theme === "dark" ? "dark" : "light"
      applyTheme(colorTheme, mode)
      
      logger.settingsDebug('Applied theme', { colorTheme, themeMode: theme, mode })
    } catch (error) {
      logger.settingsError('Error applying theme', 
        { colorTheme, themeMode: theme, error: error instanceof Error ? error.message : String(error) },
        error instanceof Error ? error : undefined
      )
    }
  }, [colorTheme, theme, preferencesLoaded])
  
  // Trigger unified debounced save when theme preferences change
  useEffect(() => {
    if (!preferencesLoaded) return
    
    const preferences: Partial<UserPreferences> = {
      colorTheme,
      themeMode: theme as UserPreferences['themeMode'],
    }
    
    debouncedUpdatePreferences(preferences)
  }, [colorTheme, theme, preferencesLoaded, debouncedUpdatePreferences])

  // Trigger unified debounced save when language changes
  useEffect(() => {
    if (!preferencesLoaded) return
    
    const preferences: Partial<UserPreferences> = { language }
    debouncedUpdatePreferences(preferences)
  }, [language, preferencesLoaded, debouncedUpdatePreferences])

  // Cleanup effect to clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
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