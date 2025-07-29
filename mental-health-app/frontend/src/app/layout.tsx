import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mental Health App - Your Journey to Wellness',
  description: 'A comprehensive mental health platform providing anonymous support, professional guidance, and personalized wellness tools.',
  keywords: 'mental health, depression, anxiety, therapy, wellness, support',
  openGraph: {
    title: 'Mental Health App - Your Journey to Wellness',
    description: 'A comprehensive mental health platform providing anonymous support, professional guidance, and personalized wellness tools.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#5A67D8" />
      </head>
      <body className="antialiased">
        <div id="root" className="min-h-screen">
          {children}
        </div>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  )
}