import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { QueryProvider } from '@/components/providers/query-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Mode - AI Music Agent',
  description: 'Your personal AI DJ that creates perfect mixtapes through natural language',
  keywords: ['music', 'ai', 'playlist', 'mixtape', 'spotify', 'soundcloud'],
  authors: [{ name: 'Smart Mode Team' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Smart Mode - AI Music Agent',
    description: 'Your personal AI DJ that creates perfect mixtapes through natural language',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Mode - AI Music Agent',
    description: 'Your personal AI DJ that creates perfect mixtapes through natural language',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}