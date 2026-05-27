'use client'

import { useEffect, useState } from 'react'

export default function PWADebug() {
  const [logs, setLogs] = useState<string[]>([])

  const add = (msg: string) => setLogs((prev) => [...prev, msg])

  useEffect(() => {
    add('Iniciando verificação PWA...')

    if (!('serviceWorker' in navigator)) {
      add('❌ Service Worker NÃO suportado')
      return
    }
    add('✅ Service Worker suportado')

    navigator.serviceWorker.register('/sw.js')
      .then((reg) => add(`✅ SW registrado. Scope: ${reg.scope}`))
      .catch((err) => add(`❌ SW falhou: ${err.message}`))

    navigator.serviceWorker.getRegistrations().then((regs) => {
      add(`📋 SWs ativos: ${regs.length}`)
    })

    window.addEventListener('beforeinstallprompt', () => {
      add('🎉 beforeinstallprompt disparou! App instalável.')
    })

    // Verifica se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      add('📱 App já está instalado (standalone)')
    } else {
      add('🌐 Rodando no navegador (não instalado)')
    }

    // Verifica o manifesto
    const link = document.querySelector('link[rel="manifest"]')
    if (link) {
      add(`✅ Manifest linkado: ${link.getAttribute('href')}`)
    } else {
      add('❌ Manifest NÃO encontrado no HTML')
    }
  }, [])

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: 8,
      right: 8,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.92)',
      border: '1px solid #ff5a00',
      borderRadius: 8,
      padding: 12,
      fontSize: 11,
      fontFamily: 'monospace',
      color: '#fff',
      maxHeight: 220,
      overflowY: 'auto',
    }}>
      <div style={{ color: '#ff5a00', fontWeight: 'bold', marginBottom: 6 }}>
        PWA Debug
      </div>
      {logs.map((l, i) => (
        <div key={i} style={{ marginBottom: 2 }}>{l}</div>
      ))}
    </div>
  )
}
