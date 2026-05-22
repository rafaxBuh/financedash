import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import SessionProvider from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinanceDash - Controle Financeiro Pessoal',
  description: 'Gerencie suas finanças pessoais com facilidade',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-background text-text-primary min-h-screen`}>
        <SessionProvider>
          <Sidebar />
          {/* Desktop: offset by sidebar width. Mobile: offset by top bar height */}
          <main className="lg:pl-60 pt-14 lg:pt-0 min-h-screen overflow-auto">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}
