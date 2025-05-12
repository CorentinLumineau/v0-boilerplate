"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { UserDropdown } from "@/components/user-dropdown"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useLanguage } from "@/hooks/use-language"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()
  const { t } = useLanguage()

  // Convert pathname to breadcrumb segments
  const segments = pathname.split("/").filter(Boolean)
  const isHome = segments.length === 0

  return (
    <header className="sticky top-0 z-40 flex w-full h-16 items-center justify-between border-b bg-background px-4 shadow-sm">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <Breadcrumb>
          <BreadcrumbList>
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
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="relative z-50">
        <UserDropdown />
      </div>
    </header>
  )
}
