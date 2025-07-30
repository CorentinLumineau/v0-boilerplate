"use client"

import React from "react"

import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "next-themes"
import { themes } from "@/lib/theme"

export function ThemeDebug() {
  const { colorTheme } = useSettings()
  const { theme } = useTheme()

  const currentMode = theme === "dark" ? "dark" : "light"
  const currentTheme = themes[colorTheme][currentMode]

  return (
    <div className="p-4 border rounded-md">
      <h3 className="text-lg font-semibold mb-2">Theme Debug</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Color Theme:</div>
        <div>{colorTheme}</div>
        <div>Mode:</div>
        <div>{currentMode}</div>
        <div className="col-span-2 mt-2 mb-1 font-medium">Current Variables:</div>
        {Object.entries(currentTheme).map(([key, value]) => (
          <React.Fragment key={key}>
            <div className="font-mono">--{key.replace(/([A-Z])/g, "-$1").toLowerCase()}:</div>
            <div className="font-mono">{value}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
