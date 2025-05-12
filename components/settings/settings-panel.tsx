"use client"

import { useLanguage } from "@/hooks/use-language"
import { useSettings } from "@/hooks/use-settings"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { FlagGB, FlagFR } from "@/components/flags"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

export function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { colorTheme, setColorTheme, radiusValue, setRadiusValue } = useSettings()

  const handleThemeChange = (value: string) => {
    if (value) {
      try {
        setTheme(value)
      } catch (error) {
        console.error("Error setting theme:", error)
      }
    }
  }

  const handleLanguageChange = (value: string) => {
    if (value && (value === "en" || value === "fr")) {
      try {
        setLanguage(value as "en" | "fr")
      } catch (error) {
        console.error("Error setting language:", error)
      }
    }
  }

  const colorThemes = [
    // Red family
    { value: "red", label: "Red", color: "bg-[hsl(0,72%,51%)]" },
    { value: "rose", label: "Rose", color: "bg-[hsl(336,80%,58%)]" },
    // Orange family
    { value: "orange", label: "Orange", color: "bg-[hsl(24,95%,53%)]" },
    { value: "amber", label: "Amber", color: "bg-[hsl(45,90%,45%)]" },
    { value: "brown", label: "Brown", color: "bg-[hsl(30,60%,35%)]" },
    // Yellow family
    { value: "yellow", label: "Yellow", color: "bg-[hsl(48,96%,53%)]" },
    { value: "lime", label: "Lime", color: "bg-[hsl(85,80%,40%)]" },
    // Green family
    { value: "green", label: "Green", color: "bg-[hsl(142,50%,40%)]" },
    { value: "emerald", label: "Emerald", color: "bg-[hsl(160,84%,39%)]" },
    { value: "teal", label: "Teal", color: "bg-[hsl(171,70%,40%)]" },
    { value: "cyan", label: "Cyan", color: "bg-[hsl(190,90%,50%)]" },
    // Blue family
    { value: "blue", label: "Blue", color: "bg-[hsl(221,83%,53%)]" },
    { value: "indigo", label: "Indigo", color: "bg-[hsl(245,70%,50%)]" },
    // Purple family
    { value: "violet", label: "Violet", color: "bg-[hsl(271,81%,56%)]" },
    { value: "purple", label: "Purple", color: "bg-[hsl(280,75%,45%)]" },
    { value: "fuchsia", label: "Fuchsia", color: "bg-[hsl(300,95%,60%)]" },
    { value: "pink", label: "Pink", color: "bg-[hsl(330,85%,60%)]" },
    // Neutral
    { value: "default", label: "Default", color: "bg-[hsl(0,0%,0%)]" },
    { value: "gray", label: "Gray", color: "bg-[hsl(0,0%,25%)]" },
    { value: "slate", label: "Slate", color: "bg-[hsl(215,30%,40%)]" },
  ]

  const radiusValues = [
    { value: "0", label: "0" },
    { value: "0.3", label: "0.3" },
    { value: "0.5", label: "0.5" },
    { value: "0.75", label: "0.75" },
    { value: "1.0", label: "1.0" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-medium">{t("theme")}</h3>
        <ToggleGroup type="single" value={theme || "system"} onValueChange={handleThemeChange} className="w-full">
          <ToggleGroupItem value="light" aria-label="Light Mode" title="Light Mode" className="flex-1 px-2">
            <Sun className="mr-2 h-4 w-4" />
            <span>{t("light")}</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark Mode" title="Dark Mode" className="flex-1 px-2">
            <Moon className="mr-2 h-4 w-4" />
            <span>{t("dark")}</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="system" aria-label="System Mode" title="System Mode" className="flex-1 px-2">
            <Monitor className="mr-2 h-4 w-4" />
            <span>{t("system")}</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">{t("language")}</h3>
        <ToggleGroup type="single" value={language} onValueChange={handleLanguageChange} className="w-full">
          <ToggleGroupItem value="en" aria-label="English" title="English" className="flex-1 px-2">
            <span className="flex items-center justify-center">
              <FlagGB className="mr-2" />
              <span>{t("english")}</span>
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem value="fr" aria-label="French" title="French" className="flex-1 px-2">
            <span className="flex items-center justify-center">
              <FlagFR className="mr-2" />
              <span>{t("french")}</span>
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">{t("colorTheme")}</h3>
        <div className="grid grid-cols-5 gap-3">
          {colorThemes.map((theme) => (
            <button
              key={theme.value}
              className={cn(
                "relative flex h-10 w-full items-center justify-center rounded-md border-2 bg-background text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                colorTheme === theme.value ? "border-primary" : "border-border",
              )}
              onClick={() => setColorTheme(theme.value as any)}
              title={theme.label}
            >
              <span className={cn("absolute inset-1 rounded-sm", theme.color)} />
              {colorTheme === theme.value && <span className="absolute h-4 w-4 text-white">✓</span>}
              <span className="sr-only">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">{t("borderRadius")}</h3>
        <div className="flex flex-wrap gap-2">
          {radiusValues.map((radius) => (
            <button
              key={radius.value}
              className={cn(
                "flex h-10 min-w-[48px] items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                radiusValue === radius.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={() => setRadiusValue(radius.value as any)}
            >
              {radius.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
