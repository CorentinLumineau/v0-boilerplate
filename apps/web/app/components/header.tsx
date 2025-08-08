"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { UserDropdown } from "@/components/user-dropdown"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Button } from "@boilerplate/ui"
// Update import to use the consolidated file
import { useLanguageSettings } from "@/hooks/use-settings-store"

/**
 * Renders the application header with dynamic breadcrumb navigation and a user dropdown.
 *
 * The breadcrumb adapts to the current URL path, displaying localized labels for "home" and "settings" when appropriate. Each path segment is shown as a breadcrumb item, with links for intermediate segments and a page label for the current location.
 */
export function Header() {
  const pathname = usePathname()
  const { t } = useLanguageSettings()

  // Convert pathname to breadcrumb segments
  const segments = pathname.split("/").filter(Boolean)
  const isHome = segments.length === 0
  const isSettings = pathname === "/settings"

  return (
    <header className="sticky top-0 z-40 flex w-full h-16 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center">
        <Breadcrumb className="py-1">
          <BreadcrumbList>
            {isSettings ? (
              <BreadcrumbItem>
                <BreadcrumbPage>{t("settings")}</BreadcrumbPage>
              </BreadcrumbItem>
            ) : (
              <>
                <BreadcrumbItem>
                  {isHome ? (
                    <BreadcrumbPage>{t("home")}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href="/">{t("home")}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {segments.map((segment, index) => {
                  const href = `/${segments.slice(0, index + 1).join("/")}`
                  const isLast = index === segments.length - 1

                  return (
                    <React.Fragment key={segment}>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{segment}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  )
                })}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="relative z-50 flex items-center gap-2">
        <NotificationBell />
        <UserDropdown />
      </div>
    </header>
  )
}