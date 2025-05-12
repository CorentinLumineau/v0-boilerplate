"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type ColorTheme = "default" | "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet"
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

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
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
      console.error("Error saving settings to localStorage:", error)
    }
  }, [colorTheme, radiusValue])

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
