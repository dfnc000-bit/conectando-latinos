// Funciones de sesion del lado del cliente — solo localStorage
// Los tipos y constantes estan en lib/types.ts

import type { Usuario } from '@/lib/types'

function isBrowser() {
  return typeof window !== 'undefined'
}

export function getSesion(): (Usuario & { proveedorId?: string }) | null {
  if (!isBrowser()) return null
  try {
    return JSON.parse(localStorage.getItem('cl_sesion') || 'null')
  } catch {
    return null
  }
}

export function setSesion(u: (Usuario & { proveedorId?: string }) | null) {
  if (!isBrowser()) return
  if (u) localStorage.setItem('cl_sesion', JSON.stringify(u))
  else localStorage.removeItem('cl_sesion')
}
