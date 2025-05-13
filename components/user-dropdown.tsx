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

export function UserDropdown() {
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme, radiusValue, setRadiusValue } = useThemeSettings()
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

  const colorThemes = [
    // Red family
    { value: "red", label: "Red", color: "bg-[hsl(0,72%,51%)]" },
    { value: "ruby", label: "Ruby", color: "bg-[hsl(350,75%,45%)]" },
    { value: "crimson", label: "Crimson", color: "bg-[hsl(345,75%,45%)]" },
    { value: "rose", label: "Rose", color: "bg-[hsl(336,80%,58%)]" },
    { value: "pink", label: "Pink", color: "bg-[hsl(330,85%,60%)]" },
    { value: "magenta", label: "Magenta", color: "bg-[hsl(320,80%,55%)]" },
    { value: "fuchsia", label: "Fuchsia", color: "bg-[hsl(300,95%,60%)]" },
    { value: "plum", label: "Plum", color: "bg-[hsl(290,70%,50%)]" },

    // Purple family
    { value: "purple", label: "Purple", color: "bg-[hsl(280,75%,45%)]" },
    { value: "violet", label: "Violet", color: "bg-[hsl(271,81%,56%)]" },
    { value: "lavender", label: "Lavender", color: "bg-[hsl(255,70%,65%)]" },

    // Blue family
    { value: "indigo", label: "Indigo", color: "bg-[hsl(245,70%,50%)]" },
    { value: "navy", label: "Navy", color: "bg-[hsl(230,70%,40%)]" },
    { value: "blue", label: "Blue", color: "bg-[hsl(221,83%,53%)]" },
    { value: "azure", label: "Azure", color: "bg-[hsl(215,80%,50%)]" },
    { value: "sky", label: "Sky", color: "bg-[hsl(205,85%,55%)]" },

    // Cyan/Teal family
    { value: "cyan", label: "Cyan", color: "bg-[hsl(190,90%,50%)]" },
    { value: "aqua", label: "Aqua", color: "bg-[hsl(185,85%,45%)]" },
    { value: "turquoise", label: "Turquoise", color: "bg-[hsl(175,80%,40%)]" },
    { value: "teal", label: "Teal", color: "bg-[hsl(171,70%,40%)]" },

    // Green family
    { value: "mint", label: "Mint", color: "bg-[hsl(150,55%,45%)]" },
    { value: "emerald", label: "Emerald", color: "bg-[hsl(160,84%,39%)]" },
    { value: "green", label: "Green", color: "bg-[hsl(142,50%,40%)]" },
    { value: "forest", label: "Forest", color: "bg-[hsl(135,60%,35%)]" },
    { value: "olive", label: "Olive", color: "bg-[hsl(110,40%,40%)]" },

    // Yellow/Lime family
    { value: "chartreuse", label: "Chartreuse", color: "bg-[hsl(90,65%,45%)]" },
    { value: "lime", label: "Lime", color: "bg-[hsl(85,80%,40%)]" },
    { value: "yellow", label: "Yellow", color: "bg-[hsl(48,96%,53%)]" },
    { value: "gold", label: "Gold", color: "bg-[hsl(50,85%,45%)]" },
    { value: "amber", label: "Amber", color: "bg-[hsl(45,90%,45%)]" },

    // Orange/Brown family
    { value: "peach", label: "Peach", color: "bg-[hsl(35,85%,65%)]" },
    { value: "orange", label: "Orange", color: "bg-[hsl(24,95%,53%)]" },
    { value: "copper", label: "Copper", color: "bg-[hsl(25,70%,45%)]" },
    { value: "rust", label: "Rust", color: "bg-[hsl(15,80%,40%)]" },
    { value: "brown", label: "Brown", color: "bg-[hsl(30,60%,35%)]" },

    // Neutral/Gray family
    { value: "default", label: "Default", color: "bg-[hsl(0,0%,0%)]" },
    { value: "gray", label: "Gray", color: "bg-[hsl(0,0%,25%)]" },
    { value: "slate", label: "Slate", color: "bg-[hsl(215,30%,40%)]" },
    { value: "zinc", label: "Zinc", color: "bg-[hsl(240,5%,35%)]" },
    { value: "stone", label: "Stone", color: "bg-[hsl(60,5%,35%)]" },
  ]

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
              <div className="grid grid-cols-5 gap-1">
                {colorThemes.map((theme) => (
                  <button
                    key={theme.value}
                    className={cn(
                      "relative flex h-8 w-full items-center justify-center rounded-md border-2 bg-background text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
