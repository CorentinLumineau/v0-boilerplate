"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type ColorTheme, applyTheme } from "@/lib/theme"
import { useTheme } from "next-themes"

type RadiusValue = "0" | "0.3" | "0.5" | "0.75" | "1.0"

interface SettingsContextType {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
  radiusValue: RadiusValue
  setRadiusValue: (value: RadiusValue) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>("default")
  const [radiusValue, setRadiusValue] = useState<RadiusValue>("0.5")
  const { theme } = useTheme()

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const storedColorTheme = localStorage.getItem("colorTheme") as ColorTheme
      const storedRadiusValue = localStorage.getItem("radiusValue") as RadiusValue

      if (storedColorTheme) {
        setColorTheme(storedColorTheme)
      }

      if (storedRadiusValue) {
        setRadiusValue(storedRadiusValue)
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

      // Save settings to localStorage
      localStorage.setItem("colorTheme", colorTheme)
      localStorage.setItem("radiusValue", radiusValue)
    } catch (error) {
      console.error("Error applying theme:", error)
    }
  }, [colorTheme, radiusValue, theme])

  return (
    <SettingsContext.Provider value={{ colorTheme, setColorTheme, radiusValue, setRadiusValue }}>
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
