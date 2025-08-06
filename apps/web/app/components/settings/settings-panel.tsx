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

export function SettingsPanel() {
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
        <div className="grid grid-cols-4 gap-2">
          {availableThemes.map((themeName) => (
            <button
              key={themeName}
              className={cn(
                "h-10 w-16 rounded border-2 transition-all hover:scale-105 focus:outline-none focus:ring-1 focus:ring-ring relative bg-background",
                colorTheme === themeName
                  ? "border-primary scale-105"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handleColorThemeChange(themeName as ColorTheme)}
              title={themeName}
            >
              <div 
                className="absolute inset-1 rounded-sm"
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