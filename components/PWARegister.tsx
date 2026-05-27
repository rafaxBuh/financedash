'use client'

import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker não suportado neste navegador')
      return
    }

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registrado com sucesso. Scope:', reg.scope)
      })
      .catch((err) => {
        console.error('[PWA] Falha ao registrar Service Worker:', err)
      })

    window.addEventListener('beforeinstallprompt', () => {
      console.log('[PWA] beforeinstallprompt disparou — app é instalável!')
    })

    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App foi instalado com sucesso!')
    })
  }, [])

  return null
}
