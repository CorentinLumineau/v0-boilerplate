"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { type ColorTheme, applyTheme } from "@/lib/theme"
import { useTheme } from "next-themes"
import { getTranslation, type Language } from "@/lib/i18n"

// Settings store context type
type SettingsStoreContextType = {
  // Theme settings
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  
  // Language settings
  language: Language
  setLanguage: (language: Language) => void
  
  // Translation function
  t: (key: string) => string
}

// Create a context for the settings store
const SettingsStoreContext = createContext<SettingsStoreContextType | undefined>(undefined)

// Provider component that wraps the app and provides the settings context
export function SettingsStoreProvider({ children }: { children: React.ReactNode }) {
  // Theme settings
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
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
      const storedLanguage = localStorage.getItem("language") as Language

      if (storedColorTheme) {
        setColorTheme(storedColorTheme)
      }

      if (storedLanguage && (storedLanguage === "en" || storedLanguage === "fr")) {
        setLanguage(storedLanguage)
      }
    } catch (error) {
      // Silently handle localStorage errors
    }
  }, [])

  // Apply theme when colorTheme or theme mode changes
  useEffect(() => {
    try {
      // Set fixed border radius to 0.5rem
      document.documentElement.style.setProperty("--radius", "0.5rem")

      // Apply theme based on current mode and color theme
      const mode = theme === "dark" ? "dark" : "light"
      applyTheme(colorTheme, mode)

      // Save theme settings to localStorage
      localStorage.setItem("colorTheme", colorTheme)
    } catch (error) {
      // Silently handle theme application errors
    }
  }, [colorTheme, theme])

  // Save language to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("language", language)
    } catch (error) {
      // Silently handle localStorage errors
    }
  }, [language])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      colorTheme,
      setColorTheme,
      language,
      setLanguage,
      t,
    }),
    [colorTheme, language, t],
  )

  return (
    <SettingsStoreContext.Provider value={contextValue}>
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

  // Memoize the setter functions to prevent unnecessary re-renders
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

  // Memoize the setter functions to prevent unnecessary re-renders
  const setLanguageMemoized = useCallback(
    (lang: Language) => {
      setLanguage(lang)
    },
    [setLanguage],
  )

  // Return a memoized object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      language,
      setLanguage: setLanguageMemoized,
      t,
    }),
    [language, setLanguageMemoized, t],
  )
}

// Legacy hook for backward compatibility
export const useSettings = useSettingsStore