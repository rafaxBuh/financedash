import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import SessionProvider from '@/components/SessionProvider'
import CursorScript from '@/components/CursorScript'

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
      <body className={`${inter.className} bg-background text-text-primary min-h-screen relative`}>
        <CursorScript />
        
        {/* Custom Cursors */}
        <div id="cursor" className="hidden lg:block"></div>
        <div id="cursor-ring" className="hidden lg:block"></div>

        {/* Background Noise Texture */}
        <div 
          className="fixed inset-0 z-0 opacity-[0.02] pointer-events-none" 
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")", backgroundSize: '180px' }}
        />

        {/* Background Auroras */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full blur-[90px] animate-aurora-drift w-[60vw] h-[50vh] bg-[radial-gradient(ellipse,rgba(255,90,0,0.12)_0%,transparent_70%)] top-[-10vh] right-[-10vw]" />
          <div className="absolute rounded-full blur-[90px] animate-aurora-drift w-[50vw] h-[55vh] bg-[radial-gradient(ellipse,rgba(0,255,136,0.08)_0%,transparent_70%)] bottom-[-10vh] left-[-10vw] animation-delay-[-4s]" />
          <div className="absolute rounded-full blur-[90px] animate-aurora-drift w-[35vw] h-[35vh] bg-[radial-gradient(ellipse,rgba(255,90,0,0.06)_0%,transparent_70%)] top-[35%] left-[35%] animation-delay-[-8s]" />
        </div>

        <SessionProvider>
          <div className="relative z-10 flex flex-col min-h-screen pb-20 lg:pb-0">
            <Sidebar />
            <main className="flex-1 lg:pl-64 pt-24 lg:pt-8 min-h-screen overflow-auto">
              {children}
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}

