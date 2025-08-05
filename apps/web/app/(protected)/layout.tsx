'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Header } from '@/components/header'
import { getVersion } from '@boilerplate/config/project.config'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending: isLoading, error } = useSession()
  const router = useRouter()
  const version = getVersion()

  useEffect(() => {
    if (!isLoading && (!session || error)) {
      router.push('/landing')
    }
  }, [session, isLoading, error, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="text-muted-foreground">Checking authentication...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to landing
  }

  // Return the full app layout for authenticated users
  return (
    <div className="flex h-screen">
      <Sidebar version={version} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  )
}