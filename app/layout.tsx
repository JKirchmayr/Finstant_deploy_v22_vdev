import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import TanstackProvider from '@/context/TanstackProvider'
import Providers from '@/context/Provider'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on ios devices
}

export const metadata: Metadata = {
  title: 'Finstant - Copilot',
  description: '-',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          <TanstackProvider>{children}</TanstackProvider>
        </Providers>
        <Toaster richColors />
      </body>
    </html>
  )
}
