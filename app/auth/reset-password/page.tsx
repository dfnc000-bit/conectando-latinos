'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError('Error al actualizar. Intentá de nuevo.')
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-cl-bg">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-3xl border border-cl-gray-light px-7 py-10 shadow-sm text-center max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-cl-verde mb-2">¡Contraseña actualizada!</h2>
            <p className="text-cl-gray text-sm">Redirigiendo al login...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-cl-bg">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-cl-gray-light px-7 py-6 shadow-sm">
            <h2 className="text-xl font-bold mb-5 text-center">Nueva contraseña</h2>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-cl-gray text-[0.7rem] font-bold uppercase tracking-wider mb-1.5">Nueva contraseña</label>
                <input className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </div>
              <div>
                <label className="block text-cl-gray text-[0.7rem] font-bold uppercase tracking-wider mb-1.5">Confirmar contraseña</label>
                <input className="form-input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} placeholder="Repetí la contraseña" />
              </div>
              <button onClick={handleSubmit} disabled={loading} className="w-full bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm rounded-xl py-3.5 transition-colors disabled:opacity-60">
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
