"use client"

import { useState } from "react"
import { LogOut, Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { useLanguage } from "@/hooks/use-language"
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

export function UserDropdown() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
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

  // Using "username" as a placeholder for now
  const username = "username"

  return (
    <div className="relative z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative">
            {username}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 z-50" align="end">
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
                    <span className="mr-1">🇬🇧</span>
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="fr" aria-label="French" title="French" className="flex-1 px-2">
                  <span className="flex items-center justify-center">
                    <span className="mr-1">🇫🇷</span>
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t("logout")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
