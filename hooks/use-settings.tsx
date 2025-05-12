"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createBlendedHsl, getThemeHsl } from "@/lib/color-utils"

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

  // Apply color blending to the theme
  useEffect(() => {
    try {
      // Get the theme color HSL values
      const { h: themeH, s: themeS } = getThemeHsl(colorTheme)
      const blendFactor = 0.05 // 5% blend

      // Apply to light theme variables
      const lightBgBlended = createBlendedHsl(0, 0, 100, themeH, themeS, blendFactor)
      document.documentElement.style.setProperty("--background-light", lightBgBlended)

      // Apply to dark theme variables
      const darkBgBlended = createBlendedHsl(140, 5, 8, themeH, themeS, blendFactor)
      document.documentElement.style.setProperty("--background-dark", darkBgBlended)

      // Apply to card, popover, etc. for light theme
      const lightCardBlended = createBlendedHsl(0, 0, 100, themeH, themeS, blendFactor)
      document.documentElement.style.setProperty("--card-light", lightCardBlended)
      document.documentElement.style.setProperty("--popover-light", lightCardBlended)

      // Apply to card, popover, etc. for dark theme
      const darkCardBlended = createBlendedHsl(140, 5, 10, themeH, themeS, blendFactor)
      document.documentElement.style.setProperty("--card-dark", darkCardBlended)
      document.documentElement.style.setProperty("--popover-dark", darkCardBlended)

      // Apply to secondary, muted, accent for light theme
      const lightSecondaryBlended = createBlendedHsl(142, 10, 90, themeH, themeS, blendFactor * 2)
      document.documentElement.style.setProperty("--secondary-light", lightSecondaryBlended)

      const lightMutedBlended = createBlendedHsl(142, 5, 95, themeH, themeS, blendFactor * 2)
      document.documentElement.style.setProperty("--muted-light", lightMutedBlended)

      const lightAccentBlended = createBlendedHsl(142, 10, 90, themeH, themeS, blendFactor * 2)
      document.documentElement.style.setProperty("--accent-light", lightAccentBlended)

      // Apply to secondary, muted, accent for dark theme
      const darkSecondaryBlended = createBlendedHsl(140, 5, 15, themeH, themeS, blendFactor * 2)
      document.documentElement.style.setProperty("--secondary-dark", darkSecondaryBlended)

      const darkMutedBlended = createBlendedHsl(140, 5, 13, themeH, themeS, blendFactor * 2)
      document.documentElement.style.setProperty("--muted-dark", darkMutedBlended)

      const darkAccentBlended = createBlendedHsl(140, 5, 15, themeH, themeS, blendFactor * 2)
      document.documentElement.style.setProperty("--accent-dark", darkAccentBlended)
    } catch (error) {
      console.error("Error applying color blending:", error)
    }
  }, [colorTheme])

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
