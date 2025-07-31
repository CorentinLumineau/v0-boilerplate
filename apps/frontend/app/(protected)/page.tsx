'use client'

import { useSession } from '@/lib/queries/auth'

export default function HomePage() {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Welcome {session?.user?.name || session?.user?.email || "User"}</h1>
      <p>You are successfully authenticated!</p>
    </div>
  );
}