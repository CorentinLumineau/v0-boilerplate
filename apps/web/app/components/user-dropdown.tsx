"use client"

import { useState } from "react"
import { LogOut, User, Monitor, Moon, Sun, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import { useThemeSettings, useLanguageSettings } from "@/hooks/use-settings-store"
import { type ColorTheme, themes } from "@/lib/theme"
import { signOut, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { FlagGB, FlagFR } from "@/components/flags"
import { getAvailableThemes } from "@boilerplate/config/project.config"

interface UserDropdownProps {
  showUsername?: boolean
  showLogout?: boolean
}

export function UserDropdown({ showUsername = true, showLogout = true }: UserDropdownProps = {}) {
  const { t } = useLanguageSettings()
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useThemeSettings()
  const { language, setLanguage } = useLanguageSettings()
  const session = useSession()
  const router = useRouter()

  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push("/login")
    } catch (error) {
      // Silently handle logout errors
      router.push("/login")
    }
  }

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

  // Use real user data or fallback to translated username
  const user = session.data?.user
  const displayName = user?.name || user?.email || t("username")
  const userEmail = user?.email

  // For non-authenticated users, show settings only
  if (!user) {
    return (
      <div className="relative z-50">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 z-50" align="end">
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
                    <span className="flex items-center justify-center gap-2">
                      <FlagGB size="lg" />
                      <span className="text-sm">EN</span>
                    </span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="fr" aria-label="French" title="French" className="flex-1 px-2">
                    <span className="flex items-center justify-center gap-2">
                      <FlagFR size="lg" />
                      <span className="text-sm">FR</span>
                    </span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <div className="px-2 py-1.5">
                <p className="text-sm mb-2">{t("colorTheme")}</p>
                <div className="grid grid-cols-4 gap-1">
                  {availableThemes.map((themeName) => (
                    <button
                      key={themeName}
                      className={cn(
                        "h-6 w-12 rounded border-2 transition-all hover:scale-105 focus:outline-none focus:ring-1 focus:ring-ring relative bg-background",
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
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <div className="relative z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size={showUsername ? "default" : "icon"} className="relative">
            {showUsername ? displayName : <User className="h-4 w-4" />}
            {!showUsername && <span className="sr-only">User menu</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 z-50" align="end">
          <DropdownMenuLabel>
            <div>
              <div className="font-medium">{displayName}</div>
              {userEmail && displayName !== userEmail && (
                <div className="text-sm text-muted-foreground font-normal">{userEmail}</div>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Settings Panel */}
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
                  <span className="flex items-center justify-center gap-2">
                    <FlagGB size="lg" />
                    <span className="text-sm">EN</span>
                  </span>
                </ToggleGroupItem>
                <ToggleGroupItem value="fr" aria-label="French" title="French" className="flex-1 px-2">
                  <span className="flex items-center justify-center gap-2">
                    <FlagFR size="lg" />
                    <span className="text-sm">FR</span>
                  </span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <div className="px-2 py-1.5">
              <p className="text-sm mb-2">{t("colorTheme")}</p>
              <div className="grid grid-cols-4 gap-1">
                {availableThemes.map((themeName) => (
                  <button
                    key={themeName}
                    className={cn(
                      "h-6 w-12 rounded border-2 transition-all hover:scale-105 focus:outline-none focus:ring-1 focus:ring-ring relative bg-background",
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
          </DropdownMenuGroup>
          
          {showLogout && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-500 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 font-medium cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}