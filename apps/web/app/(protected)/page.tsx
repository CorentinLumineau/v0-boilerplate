'use client'

import { useSession } from '@/lib/auth-client'
import { Button } from '@boilerplate/ui'
import Link from 'next/link'
import { Construction, Settings, LogOut } from 'lucide-react'
import { signOut } from '@/lib/auth-client'

export default function ProtectedHome() {
  const { data: session, isPending: isLoading } = useSession()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      {/* Simple Work in Progress */}
      <div className="text-center space-y-4">
        <Construction className="h-20 w-20 text-primary mx-auto" />
        <h1 className="text-3xl font-bold">Work in Progress</h1>
        <p className="text-muted-foreground">This page is under development</p>
      </div>

      {/* Simple Actions */}
      <div className="flex gap-4">
        <Button asChild variant="outline">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => signOut()}
          className="text-red-500 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
} 