import type React from "react"
import type { Metadata } from "next"
import "@fontsource/inter/300.css"
import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"
import "@fontsource/inter/800.css"
import "@fontsource/inter/900.css"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { AppLayout } from "@/components/app-layout"
// Import the correct provider
import { SettingsStoreProvider } from "@/hooks/use-settings-store"
import { getVersion } from "@boilerplate/config/project.config"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import { NotificationProvider } from "@/hooks/use-notifications"
import { QueryProvider } from "@/providers/query-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"

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
      <body className="font-sans">
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {/* Use the correct provider */}
            <SettingsStoreProvider>
              <NotificationProvider>
                <ErrorBoundary>
                  <AppLayout version={version}>{children}</AppLayout>
                  <InstallPrompt />
                  <OfflineIndicator />
                  <Toaster />
                </ErrorBoundary>
              </NotificationProvider>
            </SettingsStoreProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}