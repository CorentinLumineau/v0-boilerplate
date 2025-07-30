import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AppLayout } from "@/components/app-layout"
// Import the correct provider
import { SettingsStoreProvider } from "@/hooks/use-settings-store"
import { getVersion } from "@/lib/project-config"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Boilerplate App",
  description: "Next.js boilerplate with sidebar, header, and content area",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const version = getVersion()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Use the correct provider */}
          <SettingsStoreProvider>
            <AuthGuard>
              <AppLayout version={version}>{children}</AppLayout>
            </AuthGuard>
          </SettingsStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
