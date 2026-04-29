'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { loginAction } from '@/lib/actions'
import { setSesion } from '@/lib/store'
import { type Usuario } from '@/lib/types'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) { setError('Completá todos los campos.'); return }
    setLoading(true)
    setError('')

    const result = await loginAction(email, password)

    if (result.error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // Guardar sesion local para la UI
    const sesion: Usuario = {
      id: result.tipo === 'admin' ? 'admin' : `u_${Date.now()}`,
      nombre: result.tipo === 'admin' ? 'Administrador' : email.split('@')[0],
      email,
      tipo: result.tipo ?? 'cliente',
      suburb: '',
      fechaRegistro: '',
    }
    setSesion(result.tipo === 'proveedor' && (result as any).proveedorId
      ? { ...sesion, proveedorId: (result as any).proveedorId } as any
      : sesion
    )

    if (result.tipo === 'admin') router.push('/admin')
    else if (result.tipo === 'proveedor') router.push('/dashboard')
    else router.push('/')
  }

  return (
    <div className="min-h-screen flex flex-col bg-cl-bg">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-b-3xl border border-t-0 border-cl-gray-light px-7 py-6 shadow-sm">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-cl-gray text-[0.7rem] font-bold uppercase tracking-wider mb-1.5">Correo electrónico</label>
                <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="tu@correo.com" />
              </div>
              <div>
                <label className="block text-cl-gray text-[0.7rem] font-bold uppercase tracking-wider mb-1.5">Contraseña</label>
                <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Tu contraseña" />
              </div>
              
              <button onClick={handleLogin} disabled={loading} className="w-full bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm rounded-xl py-3.5 transition-colors disabled:opacity-60">
                {loading ? 'Entrando...' : 'Iniciar sesión'}
              </button>
              <p className="text-center text-cl-gray text-xs">
                ¿No tenés cuenta?{' '}
                <Link href="/registro" className="text-cl-verde font-bold hover:underline">Registrarte gratis</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
