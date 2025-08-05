'use client'

import { useSession } from '@/lib/queries/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isLoading, error } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!session || error)) {
      router.push('/login')
    }
  }, [session, isLoading, error, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session) {
    return null // Will redirect to login
  }

  return <>{children}</>
}