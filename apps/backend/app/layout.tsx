import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Boilerplate Backend API',
  description: 'Next.js 15 backend API for boilerplate monorepo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}