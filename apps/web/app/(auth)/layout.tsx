"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@boilerplate/ui"
import { UserDropdown } from "@/components/user-dropdown"

function AuthHeader() {
  return (
    <header className="landing-header">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/landing" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Boilerplate</span>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button asChild variant="ghost" className="btn-ghost-subtle">
            <Link href="/landing">
              Home
            </Link>
          </Button>
          
          <UserDropdown showUsername={false} showLogout={false} />
        </div>
      </div>
    </header>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AuthHeader />
      <main>
        {children}
      </main>
    </div>
  )
}