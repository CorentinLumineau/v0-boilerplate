"use client"

import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useThemeSettings } from "@/hooks/use-settings-store"
import { cn } from "@/lib/utils"

const colorThemes = [
  { value: "default", label: "Default", color: "bg-slate-900" },
  { value: "blue", label: "Blue", color: "bg-blue-600" },
  { value: "green", label: "Green", color: "bg-green-600" },
  { value: "red", label: "Red", color: "bg-red-600" },
  { value: "orange", label: "Orange", color: "bg-orange-600" },
  { value: "purple", label: "Purple", color: "bg-purple-600" },
  { value: "pink", label: "Pink", color: "bg-pink-600" },
  { value: "teal", label: "Teal", color: "bg-teal-600" },
]

export function ColorSelectorDropdown() {
  const { colorTheme, setColorTheme } = useThemeSettings()

  const currentTheme = colorThemes.find((theme) => theme.value === colorTheme) || colorThemes[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between" aria-label="Select color theme">
          <div className="flex items-center gap-2">
            <div className={cn("h-4 w-4 rounded-full", currentTheme.color)} />
            <span>{currentTheme.label}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full min-w-[200px]" align="start">
        {colorThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setColorTheme(theme.value as any)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={cn("h-4 w-4 rounded-full", theme.color)} />
              <span>{theme.label}</span>
            </div>
            {colorTheme === theme.value && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
