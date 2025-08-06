"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { FlagGB, FlagFR } from "@/components/flags"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

// Update imports to use the consolidated file
import { useThemeSettings, useLanguageSettings } from "@/hooks/use-settings-store"
import { type ColorTheme, themes } from "@/lib/theme"
import { getAvailableThemes } from "@boilerplate/config/project.config"

interface SettingsPanelProps {
  compact?: boolean
}

export function SettingsPanel({ compact = false }: SettingsPanelProps) {
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useThemeSettings()
  const { language, setLanguage, t } = useLanguageSettings()

  const handleThemeChange = (value: string) => {
    if (value) {
      setTheme(value)
    }
  }

  const handleLanguageChange = (value: string) => {
    if (value && (value === "en" || value === "fr")) {
      setLanguage(value as "en" | "fr")
    }
  }

  const handleColorThemeChange = (theme: ColorTheme) => {
    setColorTheme(theme)
  }

  const availableThemes = getAvailableThemes()

  // Function to get primary color for a theme
  const getThemePrimaryColor = (themeName: string) => {
    const theme = themes[themeName as ColorTheme]
    if (!theme) return "hsl(0 0% 0%)" // fallback to black
    
    // Use light mode primary color for consistency
    return `hsl(${theme.light.primary})`
  }

  const spaceClass = compact ? "space-y-4" : "space-y-6"
  const headingClass = compact ? "mb-2 text-sm font-medium" : "mb-3 text-lg font-medium"
  const buttonHeight = compact ? "h-8" : "h-12"
  const gridCols = compact ? "grid-cols-4" : "grid-cols-4"
  const gap = compact ? "gap-1" : "gap-2"
  const padding = compact ? "p-1" : "p-2"

  return (
    <div className={spaceClass}>
      <div>
        <h3 className={headingClass}>{t("theme")}</h3>
        <ToggleGroup type="single" value={theme || "system"} onValueChange={handleThemeChange} className="w-full">
          <ToggleGroupItem value="light" aria-label="Light Mode" title="Light Mode" className="flex-1 px-2">
            <Sun className={cn("mr-2", compact ? "h-4 w-4" : "h-4 w-4")} />
            {!compact && <span>{t("light")}</span>}
          </ToggleGroupItem>
          <ToggleGroupItem value="dark" aria-label="Dark Mode" title="Dark Mode" className="flex-1 px-2">
            <Moon className={cn("mr-2", compact ? "h-4 w-4" : "h-4 w-4")} />
            {!compact && <span>{t("dark")}</span>}
          </ToggleGroupItem>
          <ToggleGroupItem value="system" aria-label="System Mode" title="System Mode" className="flex-1 px-2">
            <Monitor className={cn("mr-2", compact ? "h-4 w-4" : "h-4 w-4")} />
            {!compact && <span>{t("system")}</span>}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className={headingClass}>{t("language")}</h3>
        <ToggleGroup type="single" value={language} onValueChange={handleLanguageChange} className="w-full">
          <ToggleGroupItem value="en" aria-label="English" title="English" className="flex-1 px-2">
            <span className="flex items-center justify-center">
              <FlagGB className="mr-2" />
              {!compact && <span>{t("english")}</span>}
              {compact && <span className="text-sm">EN</span>}
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem value="fr" aria-label="French" title="French" className="flex-1 px-2">
            <span className="flex items-center justify-center">
              <FlagFR className="mr-2" />
              {!compact && <span>{t("french")}</span>}
              {compact && <span className="text-sm">FR</span>}
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className={headingClass}>{t("colorTheme")}</h3>
        <div className={cn("grid", gridCols, gap)}>
          {availableThemes.map((themeName) => (
            <button
              key={themeName}
              className={cn(
                "w-full rounded border-2 transition-all hover:scale-105 focus:outline-none focus:ring-1 focus:ring-ring",
                buttonHeight,
                padding,
                colorTheme === themeName
                  ? "border-primary scale-105"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handleColorThemeChange(themeName as ColorTheme)}
              title={themeName}
            >
              <div
                className="h-full w-full rounded"
                style={{
                  backgroundColor: getThemePrimaryColor(themeName),
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}