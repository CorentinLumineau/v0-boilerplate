"use client"

import { useState } from "react"
import { LogOut, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

import { useLanguageSettings } from "@/hooks/use-settings-store"
import { signOut, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SettingsPanel } from "@/components/settings/settings-panel"

interface UserDropdownProps {
  showUsername?: boolean
  showLogout?: boolean
}

export function UserDropdown({ showUsername = true, showLogout = true }: UserDropdownProps = {}) {
  const { t } = useLanguageSettings()
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
          <DropdownMenuContent className="w-80 max-w-[90vw] z-50" align="end">
            <div className="p-4">
              <SettingsPanel compact />
            </div>
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
        <DropdownMenuContent className="w-80 max-w-[90vw] z-50" align="end">
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
          <div className="p-2">
            <SettingsPanel compact />
          </div>
          
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