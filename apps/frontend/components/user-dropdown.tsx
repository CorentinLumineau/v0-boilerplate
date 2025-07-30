"use client"

import { useState } from "react"
import { LogOut, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

// Update imports to use the consolidated file
import { useThemeSettings, useLanguageSettings } from "@/hooks/use-settings-store"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { FlagGB, FlagFR } from "@/components/flags"
import { ColorSelectorDropdown } from "@/components/settings/color-selector-dropdown"

export function UserDropdown() {
  const { theme, setTheme } = useTheme()
  const { radiusValue, setRadiusValue } = useThemeSettings()
  const { language, setLanguage, t } = useLanguageSettings()

  const [open, setOpen] = useState(false)

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

  // Using "username" as a placeholder for now
  const username = t("username")

  return (
    <div className="relative z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative">
            {username}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 z-50" align="end">
          <DropdownMenuLabel>{username}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <div className="px-2 py-1.5">
              <p className="text-sm mb-2">{t("theme")}</p>
              <ToggleGroup type="single" value={theme || "system"} onValueChange={handleThemeChange} className="w-full">
                <ToggleGroupItem value="light" aria-label="Light Mode" title="Light Mode" className="flex-1 px-2">
                  <Sun className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem value="dark" aria-label="Dark Mode" title="Dark Mode" className="flex-1 px-2">
                  <Moon className="h-5 w-5" />
                </ToggleGroupItem>
                <ToggleGroupItem value="system" aria-label="System Mode" title="System Mode" className="flex-1 px-2">
                  <Monitor className="h-5 w-5" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <div className="px-2 py-1.5">
              <p className="text-sm mb-2">{t("language")}</p>
              <ToggleGroup type="single" value={language} onValueChange={handleLanguageChange} className="w-full">
                <ToggleGroupItem value="en" aria-label="English" title="English" className="flex-1 px-2">
                  <span className="flex items-center justify-center">
                    <FlagGB className="mr-1" />
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="fr" aria-label="French" title="French" className="flex-1 px-2">
                  <span className="flex items-center justify-center">
                    <FlagFR className="mr-1" />
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <div className="px-2 py-1.5">
              <p className="text-sm mb-2">{t("colorTheme")}</p>
              <ColorSelectorDropdown />
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <div className="px-2 py-1.5">
              <p className="text-sm mb-2">{t("borderRadius")}</p>
              <div className="flex flex-wrap gap-1">
                {radiusValues.map((radius) => (
                  <button
                    key={radius.value}
                    className={cn(
                      "flex h-8 min-w-[36px] items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive hover:bg-destructive/10 font-medium">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
