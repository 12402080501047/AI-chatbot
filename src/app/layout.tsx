import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: {
    default: 'Nova AI',
    template: '%s | Nova AI',
  },
  description: 'A premium, ultra-fast AI chatbot experience tailored for productivity and creativity.',
  keywords: ['AI', 'Chatbot', 'Nova', 'Artificial Intelligence', 'Productivity'],
  openGraph: {
    title: 'Nova AI',
    description: 'A premium AI chatbot experience tailored for productivity and creativity.',
    url: 'https://nova-ai.vercel.app',
    siteName: 'Nova AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nova AI',
    description: 'A premium AI chatbot experience tailored for productivity and creativity.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased selection:bg-primary/30 selection:text-primary`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
