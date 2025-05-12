"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"

// Types
type ThemeMode = "light" | "dark" | "system"
type Language = "en" | "fr"
type ColorTheme = "default" | "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet"
type RadiusValue = "0" | "0.3" | "0.5" | "0.75" | "1.0"

// Translations
const translations = {
  en: {
    home: "Home",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    logout: "Logout",
    language: "Language",
    english: "English",
    french: "French",
    wip: "This boilerplate is currently in WIP",
    username: "Username",
    settings: "Settings",
    colorTheme: "Color Theme",
    borderRadius: "Border Radius",
  },
  fr: {
    home: "Accueil",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    system: "Système",
    logout: "Déconnexion",
    language: "Langue",
    english: "Anglais",
    french: "Français",
    wip: "Ce modèle est actuellement en cours de développement",
    username: "Nom d'utilisateur",
    settings: "Paramètres",
    colorTheme: "Thème de couleur",
    borderRadius: "Rayon de bordure",
  },
}

// Settings context type
interface SettingsContextType {
  // State
  themeMode: ThemeMode
  language: Language
  colorTheme: ColorTheme
  radiusValue: RadiusValue

  // Update methods
  setThemeMode: (theme: ThemeMode) => void
  setLanguage: (language: Language) => void
  setColorTheme: (theme: ColorTheme) => void
  setRadiusValue: (value: RadiusValue) => void

  // Translation helper
  t: (key: string) => string
}

// Default values
const defaultSettings = {
  themeMode: "system" as ThemeMode,
  language: "en" as Language,
  colorTheme: "default" as ColorTheme,
  radiusValue: "0.5" as RadiusValue,
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Provider component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // State for all settings
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultSettings.themeMode)
  const [language, setLanguageState] = useState<Language>(defaultSettings.language)
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(defaultSettings.colorTheme)
  const [radiusValue, setRadiusValueState] = useState<RadiusValue>(defaultSettings.radiusValue)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      // Load theme mode
      const storedThemeMode = localStorage.getItem("themeMode") as ThemeMode
      if (storedThemeMode && ["light", "dark", "system"].includes(storedThemeMode)) {
        setThemeModeState(storedThemeMode)
      }

      // Load language
      const storedLanguage = localStorage.getItem("language") as Language
      if (storedLanguage && ["en", "fr"].includes(storedLanguage)) {
        setLanguageState(storedLanguage)
      }

      // Load color theme
      const storedColorTheme = localStorage.getItem("colorTheme") as ColorTheme
      if (storedColorTheme) {
        setColorThemeState(storedColorTheme)
      }

      // Load radius value
      const storedRadiusValue = localStorage.getItem("radiusValue") as RadiusValue
      if (storedRadiusValue) {
        setRadiusValueState(storedRadiusValue)
      }
    } catch (error) {
      console.error("Error loading settings from localStorage:", error)
    }
  }, [])

  // Apply theme mode
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem("themeMode", themeMode)

      // Apply theme mode to document
      const root = document.documentElement
      root.classList.remove("light", "dark")

      if (themeMode === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        root.classList.add(systemTheme)
      } else {
        root.classList.add(themeMode)
      }

      // Listen for system theme changes if using system theme
      if (themeMode === "system") {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (e: MediaQueryListEvent) => {
          root.classList.remove("light", "dark")
          root.classList.add(e.matches ? "dark" : "light")
        }

        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
      }
    } catch (error) {
      console.error("Error applying theme mode:", error)
    }
  }, [themeMode])

  // Apply language
  useEffect(() => {
    try {
      localStorage.setItem("language", language)
      // Language is applied through the t function
    } catch (error) {
      console.error("Error saving language to localStorage:", error)
    }
  }, [language])

  // Apply color theme and radius
  useEffect(() => {
    try {
      // Save to localStorage
      localStorage.setItem("colorTheme", colorTheme)
      localStorage.setItem("radiusValue", radiusValue)

      // Apply radius value to CSS variable
      document.documentElement.style.setProperty("--radius", `${radiusValue}rem`)

      // Apply color theme class to body
      document.body.classList.remove(
        "theme-default",
        "theme-red",
        "theme-rose",
        "theme-orange",
        "theme-green",
        "theme-blue",
        "theme-yellow",
        "theme-violet",
      )
      document.body.classList.add(`theme-${colorTheme}`)
    } catch (error) {
      console.error("Error applying color theme and radius:", error)
    }
  }, [colorTheme, radiusValue])

  // Update methods with error handling
  const setThemeMode = useCallback((mode: ThemeMode) => {
    try {
      setThemeModeState(mode)
    } catch (error) {
      console.error("Error setting theme mode:", error)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    try {
      setLanguageState(lang)
    } catch (error) {
      console.error("Error setting language:", error)
    }
  }, [])

  const setColorTheme = useCallback((theme: ColorTheme) => {
    try {
      setColorThemeState(theme)
    } catch (error) {
      console.error("Error setting color theme:", error)
    }
  }, [])

  const setRadiusValue = useCallback((value: RadiusValue) => {
    try {
      setRadiusValueState(value)
    } catch (error) {
      console.error("Error setting radius value:", error)
    }
  }, [])

  // Translation helper
  const t = useCallback(
    (key: string) => {
      try {
        return translations[language][key as keyof (typeof translations)[typeof language]] || key
      } catch (error) {
        console.error(`Translation error for key: ${key}`, error)
        return key
      }
    },
    [language],
  )

  // Context value
  const value = {
    themeMode,
    language,
    colorTheme,
    radiusValue,
    setThemeMode,
    setLanguage,
    setColorTheme,
    setRadiusValue,
    t,
  }

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

// Hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
