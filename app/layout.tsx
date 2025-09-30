import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

export const metadata: Metadata = {
  title: 'LearningHub - AI-Powered Learning Companion',
  description: 'Capture content from your browser, process it with AI, and create flashcards for spaced repetition learning.',
  keywords: 'learning, flashcards, AI, spaced repetition, education, productivity',
  authors: [{ name: 'LearningHub Team' }],
  openGraph: {
    title: 'LearningHub - AI-Powered Learning Companion',
    description: 'Capture content from your browser, process it with AI, and create flashcards for spaced repetition learning.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {children}
          <Toaster />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
