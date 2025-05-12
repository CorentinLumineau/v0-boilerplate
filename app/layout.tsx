import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { ThemeProvider } from "@/components/theme-provider"
// Import the correct provider
import { SettingsStoreProvider } from "@/hooks/use-settings-store"

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
  const version = "1.0.0"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Use the correct provider */}
          <SettingsStoreProvider>
            <div className="flex h-screen">
              <Sidebar version={version} />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-4">{children}</main>
              </div>
            </div>
          </SettingsStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
