"use client"

import { Check } from "lucide-react"

import { useSettings } from "@/hooks/use-settings"
import { cn } from "@/lib/utils"

const colorThemes = [
  { value: "default", label: "Default" },
  { value: "red", label: "Red" },
  { value: "rose", label: "Rose" },
  { value: "orange", label: "Orange" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
  { value: "yellow", label: "Yellow" },
  { value: "violet", label: "Violet" },
]

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
            className={cn(
              "absolute inset-1 rounded-sm",
              theme.value === "default" ? "bg-[hsl(0,0%,0%)]" : "",
              theme.value === "red" ? "bg-[hsl(0,72%,51%)]" : "",
              theme.value === "rose" ? "bg-[hsl(336,80%,58%)]" : "",
              theme.value === "orange" ? "bg-[hsl(24,95%,53%)]" : "",
              theme.value === "green" ? "bg-[hsl(142,50%,40%)]" : "",
              theme.value === "blue" ? "bg-[hsl(221,83%,53%)]" : "",
              theme.value === "yellow" ? "bg-[hsl(48,96%,53%)]" : "",
              theme.value === "violet" ? "bg-[hsl(271,81%,56%)]" : "",
            )}
          />
          {colorTheme === theme.value && <Check className="absolute h-4 w-4 text-white" />}
          <span className="sr-only">{theme.label}</span>
        </button>
      ))}
    </div>
  )
}
