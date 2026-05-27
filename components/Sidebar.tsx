'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, ArrowLeftRight, LogOut, Tag, Building2, Target, RefreshCw, Download } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/recorrentes', label: 'Recorrentes', icon: RefreshCw },
  { href: '/metas', label: 'Metas', icon: Target },
  { href: '/categorias', label: 'Categorias', icon: Tag },
  { href: '/contas', label: 'Contas', icon: Building2 },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  if (pathname === '/login' || pathname === '/cadastro') return null

  return (
    <>
      {/* Desktop sidebar — floating glass panel */}
      <aside className="hidden lg:flex w-60 fixed inset-y-6 left-4 z-30 glass-panel rounded-2xl flex-col">
        {/* Logo */}
        <div className="px-6 py-8 border-b border-glass-border flex items-center gap-3">
          <Image src="/icons/icon-192x192.png" alt="FinanceDash" width={40} height={40} className="rounded-xl shadow-[0_0_24px_rgba(255,90,0,0.4)]" />
          <span className="text-white font-bold text-xl tracking-tight">FinanceDash</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  active
                    ? 'bg-accent/10 text-accent border border-accent/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'text-text-secondary hover:bg-surface hover:text-white border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-accent' : ''}`} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-6 border-t border-glass-border space-y-3">
          {session?.user?.email && (
            <div className="px-2">
              <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Conta</p>
              <p className="text-white text-sm truncate font-medium" title={session.user.email}>
                {session.user.email}
              </p>
            </div>
          )}
          {installPrompt && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-3 w-full px-4 py-3 text-accent hover:bg-accent/10 rounded-xl text-sm font-semibold transition-all border border-accent/20 hover:border-accent/40"
            >
              <Download className="w-5 h-5 flex-shrink-0" />
              Instalar app
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-4 py-3 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-xl text-sm font-semibold transition-all border border-transparent hover:border-danger/20"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-16 glass-panel border-x-0 border-t-0 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Image src="/icons/icon-192x192.png" alt="FinanceDash" width={32} height={32} className="rounded-lg shadow-[0_0_16px_rgba(255,90,0,0.4)]" />
          <span className="text-white font-bold text-lg tracking-tight">FinanceDash</span>
        </div>
        <div className="flex items-center gap-1">
          {installPrompt && (
            <button
              onClick={handleInstall}
              className="text-accent hover:text-accent/80 transition-colors p-2"
              aria-label="Instalar app"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-text-secondary hover:text-danger transition-colors p-2"
            aria-label="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-20 glass-panel border-x-0 border-b-0 pb-safe flex items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all ${
                active ? 'text-accent' : 'text-text-secondary hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all ${active ? 'bg-accent/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

