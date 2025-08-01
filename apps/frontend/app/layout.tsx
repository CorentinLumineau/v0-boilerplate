import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
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

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Boilerplate App",
  description: "Next.js boilerplate with sidebar, header, and content area",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Boilerplate App',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Boilerplate App',
    'application-name': 'Boilerplate App',
    'msapplication-TileColor': '#000000',
    'theme-color': '#000000',
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-256x256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
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
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {/* Use the correct provider */}
            <SettingsStoreProvider>
              <NotificationProvider>
                <AppLayout version={version}>{children}</AppLayout>
                <InstallPrompt />
                <OfflineIndicator />
              </NotificationProvider>
            </SettingsStoreProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
