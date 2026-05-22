'use client'

import { useEffect } from 'react'

export default function CursorScript() {
  useEffect(() => {
    // Apenas ative em dispositivos com mouse (não em touch)
    if (!window.matchMedia('(pointer: fine)').matches) return

    const cursor = document.getElementById('cursor')
    const cursorRing = document.getElementById('cursor-ring')

    const onMouseMove = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.left = `${e.clientX}px`
        cursor.style.top = `${e.clientY}px`
      }
      // Adicionamos um micro delay no anel para dar um efeito mais orgânico
      if (cursorRing) {
        setTimeout(() => {
          cursorRing.style.left = `${e.clientX}px`
          cursorRing.style.top = `${e.clientY}px`
        }, 50)
      }
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return null
}
