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

type RadiusValue = "0" | "0.3" | "0.5" | "0.75" | "1.0"

interface SettingsStoreContextType {
  // Theme settings
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  radiusValue: RadiusValue
  setRadiusValue: (value: RadiusValue) => void

  // Language settings
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

// Create a context for the settings store
const SettingsStoreContext = createContext<SettingsStoreContextType | undefined>(undefined)

// Provider component that wraps the app and provides the settings context
export function SettingsStoreProvider({ children }: { children: React.ReactNode }) {
  // Theme settings
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const [radiusValue, setRadiusValue] = useState<RadiusValue>("0.5")
  const { theme } = useTheme()

  // Language settings
  const [language, setLanguage] = useState<Language>("en")

  // Authentication state from Better Auth
  const { data: session, isPending: sessionLoading } = useSession()
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false)
  
  // Track if we've migrated localStorage to database for this session
  const hasMigratedRef = useRef<boolean>(false)
  
  // Debounce timer for database updates
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Translation function
  const t = (key: string) => {
    return getTranslation(language, key)
  }

  // Load preferences based on authentication status
  useEffect(() => {
    // Don't load if session is still loading
    if (sessionLoading) return
    
    const loadPreferences = async () => {
      try {
        if (session?.user) {
          // User is authenticated
          console.log('[Settings] User authenticated, loading preferences from database')
          
          // Try to fetch from database
          const userPreferences = await fetchUserPreferences()
          
          if (userPreferences) {
            console.log('[Settings] Database preferences loaded:', userPreferences)
            setColorTheme((userPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme!)
            setRadiusValue((userPreferences.radiusValue as RadiusValue) || DEFAULT_PREFERENCES.radiusValue!)
            setLanguage((userPreferences.language as Language) || DEFAULT_PREFERENCES.language!)
          } else {
            console.log('[Settings] No database preferences found, using defaults')
            // No preferences in database yet, use defaults
            setColorTheme(DEFAULT_PREFERENCES.colorTheme as ColorTheme)
            setRadiusValue(DEFAULT_PREFERENCES.radiusValue as RadiusValue)
            setLanguage(DEFAULT_PREFERENCES.language as Language)
          }
          
          // Migrate localStorage preferences to database if not done yet
          if (!hasMigratedRef.current) {
            console.log('[Settings] Migrating localStorage to database')
            await migrateLocalStorageToDatabase()
            hasMigratedRef.current = true
          }
        } else {
          // User is not authenticated, use localStorage
          console.log('[Settings] User not authenticated, using localStorage')
          const localPreferences = getLocalStoragePreferences()
          setColorTheme((localPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme!)
          setRadiusValue((localPreferences.radiusValue as RadiusValue) || DEFAULT_PREFERENCES.radiusValue!)
          setLanguage((localPreferences.language as Language) || DEFAULT_PREFERENCES.language!)
        }
      } catch (error) {
        console.error('[Settings] Error loading preferences:', error)
        // Fallback to localStorage
        const localPreferences = getLocalStoragePreferences()
        setColorTheme((localPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme!)
        setRadiusValue((localPreferences.radiusValue as RadiusValue) || DEFAULT_PREFERENCES.radiusValue!)
        setLanguage((localPreferences.language as Language) || DEFAULT_PREFERENCES.language!)
      } finally {
        setPreferencesLoaded(true)
      }
    }

    loadPreferences()
  }, [session, sessionLoading])

  // Apply theme when colorTheme or theme mode changes
  useEffect(() => {
    if (!preferencesLoaded) return
    
    try {
      // Apply radius value to CSS variable
      document.documentElement.style.setProperty("--radius", `${radiusValue}rem`)

      // Apply theme based on current mode and color theme
      const mode = theme === "dark" ? "dark" : "light"
      applyTheme(colorTheme, mode)
    } catch (error) {
      console.error('[Settings] Error applying theme:', error)
    }
  }, [colorTheme, radiusValue, theme, preferencesLoaded])
  
  // Save theme preferences with debouncing
  useEffect(() => {
    if (!preferencesLoaded) return
    
    // Clear any existing timer
    if (updateTimerRef.current) {
      clearTimeout(updateTimerRef.current)
    }
    
    // Set a new timer to save preferences after 500ms of no changes
    updateTimerRef.current = setTimeout(async () => {
      const preferences: Partial<UserPreferences> = {
        colorTheme,
        radiusValue,
      }
      
      console.log('[Settings] Saving theme preferences:', preferences)
      
      if (session?.user) {
        try {
          // Save to database
          const result = await updateUserPreferences(preferences)
          if (result) {
            console.log('[Settings] Theme preferences saved to database')
          } else {
            console.warn('[Settings] Failed to save theme preferences to database')
            // Fallback to localStorage
            saveLocalStoragePreferences(preferences)
          }
        } catch (error) {
          console.error('[Settings] Error saving theme preferences to database:', error)
          // Fallback to localStorage
          saveLocalStoragePreferences(preferences)
        }
      } else {
        // Save to localStorage for anonymous users
        saveLocalStoragePreferences(preferences)
        console.log('[Settings] Theme preferences saved to localStorage')
      }
    }, 500) // 500ms debounce
    
    // Cleanup function
    return () => {
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current)
      }
    }
  }, [colorTheme, radiusValue, session, preferencesLoaded])

  // Save language setting when it changes with debouncing
  useEffect(() => {
    if (!preferencesLoaded) return
    
    // Use a separate timer for language to avoid conflicts
    const timer = setTimeout(async () => {
      const preferences: Partial<UserPreferences> = { language }
      
      console.log('[Settings] Saving language preference:', preferences)
      
      if (session?.user) {
        try {
          // Save to database
          const result = await updateUserPreferences(preferences)
          if (result) {
            console.log('[Settings] Language preference saved to database')
          } else {
            console.warn('[Settings] Failed to save language preference to database')
            // Fallback to localStorage
            saveLocalStoragePreferences(preferences)
          }
        } catch (error) {
          console.error('[Settings] Error saving language preference to database:', error)
          // Fallback to localStorage
          saveLocalStoragePreferences(preferences)
        }
      } else {
        // Save to localStorage for anonymous users
        saveLocalStoragePreferences(preferences)
        console.log('[Settings] Language preference saved to localStorage')
      }
    }, 500) // 500ms debounce
    
    // Cleanup function
    return () => clearTimeout(timer)
  }, [language, session, preferencesLoaded])

  return (
    <SettingsStoreContext.Provider
      value={{
        colorTheme,
        setColorTheme,
        radiusValue,
        setRadiusValue,
        language,
        setLanguage,
        t,
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
  const { colorTheme, setColorTheme, radiusValue, setRadiusValue } = useSettingsStore()

  // Enhanced setter functions that handle both database and localStorage
  const setColorThemeMemoized = useCallback(
    (theme: ColorTheme) => {
      setColorTheme(theme)
    },
    [setColorTheme],
  )

  const setRadiusValueMemoized = useCallback(
    (value: RadiusValue) => {
      setRadiusValue(value)
    },
    [setRadiusValue],
  )

  // Return a memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      colorTheme,
      setColorTheme: setColorThemeMemoized,
      radiusValue,
      setRadiusValue: setRadiusValueMemoized,
    }),
    [colorTheme, setColorThemeMemoized, radiusValue, setRadiusValueMemoized],
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
    [t, language],
  ) // Include language as a dependency since t depends on it

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