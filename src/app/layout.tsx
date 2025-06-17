import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Marketing Dashboard - Métricas Unificadas',
  description: 'Dashboard integrado para visualização de métricas de marketing multicanal',
  keywords: 'dashboard, marketing, analytics, google ads, facebook ads, métricas',
  authors: [{ name: 'Marketing Dashboard' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Marketing Dashboard',
    description: 'Todas suas métricas de marketing em um só lugar',
    type: 'website',
    locale: 'pt_BR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}