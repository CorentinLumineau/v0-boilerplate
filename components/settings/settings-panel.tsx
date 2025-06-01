"use client"

import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { FlagGB, FlagFR } from "@/components/flags"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

// Update imports to use the consolidated file
import { useThemeSettings, useLanguageSettings } from "@/hooks/use-settings-store"
import { ColorSelectorDropdown } from "@/components/settings/color-selector-dropdown"

export function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const { radiusValue, setRadiusValue } = useThemeSettings()
  const { language, setLanguage, t } = useLanguageSettings()

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
        <ColorSelectorDropdown />
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
