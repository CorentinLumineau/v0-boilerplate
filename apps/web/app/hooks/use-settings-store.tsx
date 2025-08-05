"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
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

  // Authentication and preferences state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false)

  // Translation function
  const t = (key: string) => {
    return getTranslation(language, key)
  }

  // Load preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // First, try to fetch from database (for authenticated users)
        const userPreferences = await fetchUserPreferences()
        
        if (userPreferences) {
          // User is authenticated, use database preferences
          setIsAuthenticated(true)
          setColorTheme((userPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme!)
          setRadiusValue((userPreferences.radiusValue as RadiusValue) || DEFAULT_PREFERENCES.radiusValue!)
          setLanguage((userPreferences.language as Language) || DEFAULT_PREFERENCES.language!)
          
          // Migrate any existing localStorage preferences to database
          await migrateLocalStorageToDatabase()
        } else {
          // User is not authenticated, use localStorage
          setIsAuthenticated(false)
          const localPreferences = getLocalStoragePreferences()
          setColorTheme((localPreferences.colorTheme as ColorTheme) || DEFAULT_PREFERENCES.colorTheme!)
          setRadiusValue((localPreferences.radiusValue as RadiusValue) || DEFAULT_PREFERENCES.radiusValue!)
          setLanguage((localPreferences.language as Language) || DEFAULT_PREFERENCES.language!)
        }
      } catch (error) {
        console.error("Error loading preferences:", error)
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
  }, [])

  // Apply theme when colorTheme or theme mode changes
  useEffect(() => {
    if (!preferencesLoaded) return
    
    try {
      // Apply radius value to CSS variable
      document.documentElement.style.setProperty("--radius", `${radiusValue}rem`)

      // Apply theme based on current mode and color theme
      const mode = theme === "dark" ? "dark" : "light"
      applyTheme(colorTheme, mode)

      // Save preferences
      const preferences: Partial<UserPreferences> = {
        colorTheme,
        radiusValue,
      }

      if (isAuthenticated) {
        // Save to database (async, don't wait)
        updateUserPreferences(preferences).catch(error => {
          console.error("Error saving theme preferences to database:", error)
          // Fallback to localStorage
          saveLocalStoragePreferences(preferences)
        })
      } else {
        // Save to localStorage
        saveLocalStoragePreferences(preferences)
      }
    } catch (error) {
      console.error("Error applying theme:", error)
    }
  }, [colorTheme, radiusValue, theme, isAuthenticated, preferencesLoaded])

  // Save language setting when it changes
  useEffect(() => {
    if (!preferencesLoaded) return
    
    try {
      const preferences: Partial<UserPreferences> = { language }

      if (isAuthenticated) {
        // Save to database (async, don't wait)
        updateUserPreferences(preferences).catch(error => {
          console.error("Error saving language preference to database:", error)
          // Fallback to localStorage
          saveLocalStoragePreferences(preferences)
        })
      } else {
        // Save to localStorage
        saveLocalStoragePreferences(preferences)
      }
    } catch (error) {
      console.error("Error saving language preference:", error)
    }
  }, [language, isAuthenticated, preferencesLoaded])

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