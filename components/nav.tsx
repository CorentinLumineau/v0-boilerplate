"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export function Navigation({ user }: { user: any }) {
  const pathname = usePathname()

  return (
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">
          Your App
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className={pathname === "/dashboard" ? "font-medium" : ""}>
                Dashboard
              </Link>
              <Link href="/profile" className={pathname === "/profile" ? "font-medium" : ""}>
                Profile
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className={pathname === "/login" ? "font-medium" : ""}>
                Sign In
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
