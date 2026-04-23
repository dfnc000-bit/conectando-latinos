'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, ShieldCheck, Map } from 'lucide-react'
import { getSesion, setSesion } from '@/lib/store'
import { type Usuario } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  onOpenRegister?: (tab: 'cliente' | 'proveedor') => void
}

export function Navbar({ onOpenRegister }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [sesion, setSesionState] = useState<Usuario | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    // Leer sesion de Supabase primero, si no del store local
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      if (data.user) {
        const local = getSesion()
        if (local) {
          setSesionState(local)
        } else {
          setSesionState({
            id: data.user.id,
            nombre: data.user.user_metadata?.nombre ?? data.user.email ?? 'Usuario',
            email: data.user.email ?? '',
            tipo: data.user.user_metadata?.tipo ?? 'cliente',
            suburb: data.user.user_metadata?.suburb ?? '',
            fechaRegistro: '',
          })
        }
      } else {
        setSesionState(getSesion())
      }
    })
  }, [pathname])

  async function cerrarSesion() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setSesion(null)
    setSesionState(null)
    setUserOpen(false)
    window.location.href = '/'
  }

  const navLinks = [
    { href: '/servicios', label: 'Explorar servicios' },
    { href: '/mapa', label: 'Mapa' },
    { href: '/#como', label: 'Cómo funciona' },
    { href: '/registro?tab=proveedor', label: 'Para emprendedores' },
  ]

  return (
    <nav className="bg-cl-dark sticky top-0 z-50 h-16 flex items-center justify-between px-6 md:px-10">
      {/* Logo */}
      <Link href="/" className="flex-shrink-0 group">
        <span className="font-syne text-white text-xl font-extrabold tracking-tight leading-none group-hover:text-cl-verde2 transition-colors">
          Conectando <span className="text-cl-verde2">Latinos</span>
        </span>
        <span className="block font-jakarta text-[0.58rem] font-medium tracking-[2.5px] text-white/40 uppercase mt-0.5">
          Melbourne · Australia
        </span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`text-sm font-semibold transition-colors ${
              pathname === l.href ? 'text-cl-verde2' : 'text-white/60 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Desktop right side */}
      <div className="hidden md:flex items-center gap-2">
        {sesion ? (
          <div className="relative">
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-2 border border-white/20 text-white/80 hover:border-cl-verde2 hover:text-cl-verde2 rounded-lg px-3 py-2 text-xs font-bold transition-all"
            >
              <User size={13} />
              {sesion.nombre.split(' ')[0]}
              <ChevronDown size={12} />
            </button>
            {userOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-cl-gray-light shadow-xl overflow-hidden min-w-[180px] z-50">
                {sesion.tipo === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-cl-dark hover:bg-cl-bg transition-colors border-b border-cl-gray-light"
                  >
                    <ShieldCheck size={14} className="text-cl-verde" />
                    Panel admin
                  </Link>
                )}
                {sesion.tipo === 'proveedor' && (
                  <Link
                    href="/dashboard"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-cl-dark hover:bg-cl-bg transition-colors border-b border-cl-gray-light"
                  >
                    <LayoutDashboard size={14} className="text-cl-verde" />
                    Mi perfil
                  </Link>
                )}
                <button
                  onClick={cerrarSesion}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <LogOut size={14} />
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="border border-white/25 text-white/80 hover:border-cl-verde2 hover:text-cl-verde2 rounded-lg px-4 py-2 text-xs font-bold transition-all"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro?tab=proveedor"
              className="bg-cl-verde border border-cl-verde text-white hover:bg-cl-verde2 hover:border-cl-verde2 rounded-lg px-4 py-2 text-xs font-bold transition-all"
            >
              Registrar negocio
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-white/70 hover:text-white transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Abrir menú"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-cl-dark border-t border-white/10 px-6 py-5 flex flex-col gap-4 md:hidden z-50">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-white/60 hover:text-white text-sm font-semibold py-1"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-3 border-t border-white/10">
            {sesion ? (
              <button
                onClick={cerrarSesion}
                className="flex-1 border border-white/25 text-white/80 rounded-lg px-3 py-2.5 text-xs font-bold"
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center border border-white/25 text-white/80 rounded-lg px-3 py-2.5 text-xs font-bold"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro?tab=proveedor"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center bg-cl-verde text-white rounded-lg px-3 py-2.5 text-xs font-bold"
                >
                  Registrar negocio
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
