"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useTheme as useNextTheme } from "next-themes"
import { type Language, translations } from "@/lib/translations"

type ColorTheme = "default" | "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet"
type RadiusValue = "0" | "0.3" | "0.5" | "0.75" | "1.0"
type ThemeMode = "light" | "dark" | "system"

interface SettingsContextType {
  // Theme settings
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void

  // Color theme settings
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void

  // Border radius settings
  radiusValue: RadiusValue
  setRadiusValue: (value: RadiusValue) => void

  // Language settings
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Theme settings (light/dark/system)
  const { theme: nextTheme, setTheme: setNextTheme, resolvedTheme } = useNextTheme()

  // Color theme and radius settings
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const [radiusValue, setRadiusValue] = useState<RadiusValue>("0.5")

  // Language settings
  const [language, setLanguage] = useState<Language>("en")

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      // Load color theme and radius
      const storedColorTheme = localStorage.getItem("colorTheme") as ColorTheme
      const storedRadiusValue = localStorage.getItem("radiusValue") as RadiusValue

      // Load language
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

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem("colorTheme", colorTheme)
      localStorage.setItem("radiusValue", radiusValue)
      localStorage.setItem("language", language)

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

      // Log theme application for debugging
      console.log(`Applied theme: ${colorTheme} in ${resolvedTheme || "system"} mode`)
    } catch (error) {
      console.error("Error saving settings to localStorage:", error)
    }
  }, [colorTheme, radiusValue, language, resolvedTheme])

  // Translation function
  const t = (key: string): string => {
    try {
      return translations[language][key as keyof (typeof translations)[typeof language]] || key
    } catch (error) {
      console.error(`Translation error for key: ${key}`, error)
      return key
    }
  }

  // Wrapper for setTheme to ensure it's always one of our allowed values
  const setTheme = (value: ThemeMode) => {
    if (value && (value === "light" || value === "dark" || value === "system")) {
      try {
        setNextTheme(value)
      } catch (error) {
        console.error("Error setting theme:", error)
      }
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        theme: (nextTheme as ThemeMode) || "system",
        setTheme,
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
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
