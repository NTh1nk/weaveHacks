import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CodeTurtle | Dashboard',
  description: 'Monitor and analyze automated test results',
  icons: {
    icon: '/turtle.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
