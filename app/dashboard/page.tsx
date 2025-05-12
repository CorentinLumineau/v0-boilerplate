import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Welcome, {session.user?.name}!</h2>
        <p className="text-muted-foreground">
          You are now logged in to your account. This is your dashboard where you can manage your profile and settings.
        </p>
      </div>
    </div>
  )
}
