import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Partner Portal',
  description: 'B2B Partner Portal for Booking Management',
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
