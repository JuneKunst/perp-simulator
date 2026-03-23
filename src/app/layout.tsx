import type { Metadata } from 'next'
import { IBM_Plex_Mono, Syne } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-mono',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-syne',
})

export const metadata: Metadata = {
  title: 'Perp Simulator — Learn DeFi Futures Trading',
  description:
    'Interactive perpetuals trading simulator. Learn futures concepts hands-on — leverage, liquidation, funding rates — without risking real money.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmMono.variable} ${syne.variable} font-sans bg-[#0B0C0E] text-gray-100 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
