"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { type ColorTheme, applyTheme } from "@/lib/theme"
import { useTheme } from "next-themes"
import { getTranslation, type Language } from "@/lib/i18n"

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

  // Translation function
  const t = (key: string) => {
    return getTranslation(language, key)
  }

  // Load all settings from localStorage on mount
  useEffect(() => {
    try {
      const storedColorTheme = localStorage.getItem("colorTheme") as ColorTheme
      const storedRadiusValue = localStorage.getItem("radiusValue") as RadiusValue
      const storedLanguage = localStorage.getItem("language") as Language

      if (storedColorTheme) {
        setColorTheme(storedColorTheme)
      }

      if (storedRadiusValue) {
        setRadiusValue(storedRadiusValue)
      }

      if (storedLanguage && (storedLanguage === "en" || storedLanguage === "fr")) {
        setLanguage(storedLanguage)
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error)
    }
  }, [])

  // Apply theme when colorTheme or theme mode changes
  useEffect(() => {
    try {
      // Apply radius value to CSS variable
      document.documentElement.style.setProperty("--radius", `${radiusValue}rem`)

      // Apply theme based on current mode and color theme
      const mode = theme === "dark" ? "dark" : "light"
      applyTheme(colorTheme, mode)

      // Save theme settings to localStorage
      localStorage.setItem("colorTheme", colorTheme)
      localStorage.setItem("radiusValue", radiusValue)
    } catch (error) {
      console.error("Error applying theme:", error)
    }
  }, [colorTheme, radiusValue, theme])

  // Save language setting to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("language", language)
    } catch (error) {
      console.error("Error setting language in localStorage:", error)
    }
  }, [language])

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

  // Memoize the setter functions to prevent unnecessary re-renders
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

  // Memoize the setter function to prevent unnecessary re-renders
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
