"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { GalleryVerticalEnd, Home } from "lucide-react"

import { useLanguage } from "@/hooks/use-language"

interface SidebarProps {
  version: string
}

export function Sidebar({ version }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const navigation = [{ name: t("home"), href: "/", icon: Home, current: pathname === "/" }]

  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t bg-background pb-1 pt-2">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center p-2 ${item.current ? "text-primary" : "text-muted-foreground"}`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.name}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="hidden w-64 border-r bg-background md:block">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex aspect-square size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="text-base font-semibold">Boilerplate</span>
            <span className="text-xs text-muted-foreground">v{version}</span>
          </div>
        </Link>
      </div>
      <div className="p-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-base transition-colors ${
                item.current ? "bg-secondary text-secondary-foreground" : "text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
