import type React from "react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Navigation } from "@/components/nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <>
      <Navigation user={session.user} />
      <main>{children}</main>
    </>
  )
}
