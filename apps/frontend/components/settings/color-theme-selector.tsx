"use client"

import { Check } from "lucide-react"

import { useSettings } from "@/hooks"
import { cn } from "@/lib/utils"
import { getAvailableThemes } from "@boilerplate/config/project.config"

// Define theme colors for the selector preview
const themeColors: Record<string, string> = {
  default: "hsl(0,0%,0%)",
  red: "hsl(0,72%,51%)",
  orange: "hsl(24,95%,53%)", 
  green: "hsl(142,50%,40%)",
  blue: "hsl(221,83%,53%)",
  teal: "hsl(171,70%,40%)",
  purple: "hsl(280,75%,45%)",
  pink: "hsl(330,85%,60%)",
}

// Generate color themes from config
const colorThemes = getAvailableThemes().map(theme => ({
  value: theme,
  label: theme.charAt(0).toUpperCase() + theme.slice(1),
  color: themeColors[theme] || themeColors.default,
}))

export function ColorThemeSelector() {
  const { colorTheme, setColorTheme } = useSettings()

  return (
    <div className="grid grid-cols-4 gap-2">
      {colorThemes.map((theme) => (
        <button
          key={theme.value}
          className={cn(
            "relative flex h-9 w-full items-center justify-center rounded-md border-2 bg-background text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            colorTheme === theme.value ? "border-primary" : "border-border",
          )}
          onClick={() => setColorTheme(theme.value as any)}
          title={theme.label}
        >
          <span
            className="absolute inset-1 rounded-sm"
            style={{ backgroundColor: theme.color }}
          />
          {colorTheme === theme.value && <Check className="absolute h-4 w-4 text-white" />}
          <span className="sr-only">{theme.label}</span>
        </button>
      ))}
    </div>
  )
}
