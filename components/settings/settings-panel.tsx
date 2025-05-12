"use client"

import { useSettings } from "@/hooks/use-settings"
import { Moon, Sun, Monitor } from "lucide-react"

import { ColorThemeSelector } from "./color-theme-selector"
import { RadiusSelector } from "./radius-selector"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function SettingsPanel() {
  const { themeMode, setThemeMode, language, setLanguage, t } = useSettings()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-lg font-medium">{t("theme")}</h3>
        <ToggleGroup
          type="single"
          value={themeMode}
          onValueChange={(value) => value && setThemeMode(value as any)}
          className="w-full"
        >
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
        <ToggleGroup
          type="single"
          value={language}
          onValueChange={(value) => value && setLanguage(value as any)}
          className="w-full"
        >
          <ToggleGroupItem value="en" aria-label="English" title="English" className="flex-1 px-2">
            <span className="flex items-center justify-center">
              <span className="mr-2">🇬🇧</span>
              <span>{t("english")}</span>
            </span>
          </ToggleGroupItem>
          <ToggleGroupItem value="fr" aria-label="French" title="French" className="flex-1 px-2">
            <span className="flex items-center justify-center">
              <span className="mr-2">🇫🇷</span>
              <span>{t("french")}</span>
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">{t("colorTheme")}</h3>
        <ColorThemeSelector />
      </div>

      <div>
        <h3 className="mb-3 text-lg font-medium">{t("borderRadius")}</h3>
        <RadiusSelector />
      </div>
    </div>
  )
}
