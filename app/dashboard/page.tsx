'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { createClient } from '@/lib/supabase/client'
import { getProveedorByUserAction, updateProveedorAction, updateServiciosAction } from '@/lib/actions'
import { CATEGORIAS, SUBURBIOS } from '@/lib/types'
import { uploadProviderImage } from '@/lib/uploadImage'
import { CheckCircle, Edit3, Save, X, Plus, Trash2, Eye, MessageCircle, ToggleLeft, ToggleRight } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [proveedor, setProveedor] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editando, setEditando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  // Campos editables
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [horario, setHorario] = useState('')
  const [suburb, setSuburb] = useState('')
  const [instagram, setInstagram] = useState('')
  const [disponible, setDisponible] = useState(true)
  const [servicios, setServicios] = useState<{ name: string; price: string }[]>([])
  const [galeria, setGaleria] = useState<string[]>([])
  const [subiendoFoto, setSubiendoFoto] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: any) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      getProveedorByUserAction().then((p) => {
        if (!p) {
          router.push('/registro?tab=proveedor')
          return
        }
        setProveedor(p)
        setNombre(p.nombre ?? '')
        setDescripcion(p.descripcion ?? '')
        setHorario(p.horario ?? '')
        setSuburb(p.suburb ?? '')
        setInstagram(p.instagram ?? '')
        setDisponible(p.disponible ?? true)
        setGaleria(p.galeria ?? []) 
        setServicios((p.servicios ?? []).map((s: any) => ({ name: s.nombre, price: s.precio })))
        setLoading(false)
      })
    })
  }, [])

  async function guardar() {
    if (!proveedor) return
    setSaving(true)
    await updateProveedorAction(proveedor.id, {
      nombre, descripcion, horario, suburb, instagram, disponible
    })
    await updateServiciosAction(proveedor.id, servicios)
    setMensaje('¡Cambios guardados!')
    setEditando(false)
    setSaving(false)
    setTimeout(() => setMensaje(''), 3000)
  }

  function agregarServicio() {
    setServicios([...servicios, { name: '', price: '' }])
  }

  function eliminarServicio(i: number) {
    setServicios(servicios.filter((_, idx) => idx !== i))
  }

  function actualizarServicio(i: number, field: 'name' | 'price', value: string) {
    const nuevo = [...servicios]
    nuevo[i][field] = value
    setServicios(nuevo)
  }
  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0] || !proveedor) return
    setSubiendoFoto(true)
    try {
      const slot = galeria.length
      const url = await uploadProviderImage(e.target.files[0], proveedor.user_id, slot)
      const nuevaGaleria = [...galeria, url]
      setGaleria(nuevaGaleria)
      await updateProveedorAction(proveedor.id, { galeria: nuevaGaleria })
      setMensaje('¡Foto agregada!')
      setTimeout(() => setMensaje(''), 3000)
    } catch {
      setMensaje('Error al subir la foto')
    }
    setSubiendoFoto(false)
  }

  async function eliminarFoto(i: number) {
    const nuevaGaleria = galeria.filter((_, idx) => idx !== i)
    setGaleria(nuevaGaleria)
    await updateProveedorAction(proveedor.id, { galeria: nuevaGaleria })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cl-bg">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-cl-verde border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-cl-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-4 py-10 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-syne font-extrabold text-cl-dark text-2xl">Mi perfil</h1>
            <p className="text-cl-gray text-sm mt-1">Administra tu información visible en la plataforma</p>
          </div>
          <div className="flex gap-2">
            {editando ? (
              <>
                <button onClick={() => setEditando(false)} className="flex items-center gap-1.5 border border-cl-gray-light text-cl-gray rounded-xl px-4 py-2 text-sm font-bold hover:bg-cl-bg transition-colors">
                  <X size={14} /> Cancelar
                </button>
                <button onClick={guardar} disabled={saving} className="flex items-center gap-1.5 bg-cl-verde text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-cl-verde2 transition-colors disabled:opacity-50">
                  <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </>
            ) : (
              <button onClick={() => setEditando(true)} className="flex items-center gap-1.5 bg-cl-dark text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-cl-dark/80 transition-colors">
                <Edit3 size={14} /> Editar perfil
              </button>
            )}
          </div>
        </div>

        {mensaje && (
          <div className="bg-cl-verde/10 border border-cl-verde text-cl-verde rounded-xl px-4 py-3 text-sm font-bold flex items-center gap-2">
            <CheckCircle size={16} /> {mensaje}
          </div>
        )}

        {/* Estado */}
        <div className="bg-white rounded-2xl border border-cl-gray-light p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-cl-dark text-sm">Estado de disponibilidad</p>
            <p className="text-cl-gray text-xs mt-0.5">{disponible ? 'Visible como disponible para clientes' : 'Marcado como no disponible'}</p>
          </div>
          <button
            onClick={() => editando && setDisponible(!disponible)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${disponible ? 'bg-cl-verde/10 text-cl-verde border border-cl-verde' : 'bg-red-50 text-red-500 border border-red-200'} ${!editando ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {disponible ? <><ToggleRight size={16} /> Disponible</> : <><ToggleLeft size={16} /> No disponible</>}
          </button>
        </div>

        {/* Info básica */}
        <div className="bg-white rounded-2xl border border-cl-gray-light p-5 flex flex-col gap-4">
          <h2 className="font-syne font-bold text-cl-dark text-base">Información básica</h2>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cl-gray uppercase tracking-wider">Nombre / Negocio</label>
            {editando ? (
              <input value={nombre} onChange={e => setNombre(e.target.value)} className="border border-cl-gray-light rounded-xl px-3 py-2.5 text-sm text-cl-dark focus:outline-none focus:border-cl-verde" />
            ) : (
              <p className="text-sm text-cl-dark font-semibold">{nombre}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cl-gray uppercase tracking-wider">Descripción</label>
            {editando ? (
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} className="border border-cl-gray-light rounded-xl px-3 py-2.5 text-sm text-cl-dark focus:outline-none focus:border-cl-verde resize-none" />
            ) : (
              <p className="text-sm text-cl-gray leading-relaxed">{descripcion || 'Sin descripción'}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-cl-gray uppercase tracking-wider">Suburbio</label>
              {editando ? (
                <select value={suburb} onChange={e => setSuburb(e.target.value)} className="border border-cl-gray-light rounded-xl px-3 py-2.5 text-sm text-cl-dark focus:outline-none focus:border-cl-verde bg-white">
                  {SUBURBIOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <p className="text-sm text-cl-dark font-semibold">{suburb}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-cl-gray uppercase tracking-wider">Horario</label>
              {editando ? (
                <input value={horario} onChange={e => setHorario(e.target.value)} placeholder="Ej: Lun–Sáb 9am–7pm" className="border border-cl-gray-light rounded-xl px-3 py-2.5 text-sm text-cl-dark focus:outline-none focus:border-cl-verde" />
              ) : (
                <p className="text-sm text-cl-dark font-semibold">{horario || 'No especificado'}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-cl-gray uppercase tracking-wider">Instagram</label>
            {editando ? (
              <input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@tuinstagram" className="border border-cl-gray-light rounded-xl px-3 py-2.5 text-sm text-cl-dark focus:outline-none focus:border-cl-verde" />
            ) : (
              <p className="text-sm text-cl-dark font-semibold">{instagram ? `@${instagram}` : 'No especificado'}</p>
            )}
          </div>
        </div>

        {/* Servicios */}
        <div className="bg-white rounded-2xl border border-cl-gray-light p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-cl-dark text-base">Servicios y precios</h2>
            {editando && (
              <button onClick={agregarServicio} className="flex items-center gap-1.5 text-cl-verde text-xs font-bold hover:text-cl-verde2 transition-colors">
                <Plus size={14} /> Agregar servicio
              </button>
            )}
          </div>

          {servicios.length === 0 && (
            <p className="text-cl-gray text-sm">No hay servicios agregados aún.</p>
          )}

          {servicios.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              {editando ? (
                <>
                  <input value={s.name} onChange={e => actualizarServicio(i, 'name', e.target.value)} placeholder="Nombre del servicio" className="flex-1 border border-cl-gray-light rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cl-verde" />
                  <input value={s.price} onChange={e => actualizarServicio(i, 'price', e.target.value)} placeholder="Precio" className="w-28 border border-cl-gray-light rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cl-verde" />
                  <button onClick={() => eliminarServicio(i)} className="text-red-400 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </>
              ) : (
                <div className="flex items-center justify-between w-full px-3 py-2.5 bg-cl-bg rounded-xl border border-cl-gray-light">
                  <span className="text-sm text-cl-dark font-medium">{s.name}</span>
                  <span className="text-sm font-bold text-cl-verde">{s.price}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Galería */}
        <div className="bg-white rounded-2xl border border-cl-gray-light p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-syne font-bold text-cl-dark text-base">Galería de trabajos</h2>
            <label className={`flex items-center gap-1.5 text-cl-verde text-xs font-bold cursor-pointer hover:text-cl-verde2 transition-colors ${subiendoFoto ? 'opacity-50 pointer-events-none' : ''}`}>
              <Plus size={14} />
              {subiendoFoto ? 'Subiendo...' : 'Agregar foto'}
              <input type="file" accept="image/*" className="hidden" onChange={subirFoto} disabled={subiendoFoto} />
            </label>
          </div>
          {galeria.length === 0 && (
            <p className="text-cl-gray text-sm">No hay fotos en la galería aún.</p>
          )}
          <div className="grid grid-cols-3 gap-2">
            {galeria.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => eliminarFoto(i)}
                  className="absolute top-1.5 right-1.5 bg-red-500 text-white w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Ver perfil público */}
        <div className="bg-cl-dark rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-sm">Ver mi perfil público</p>
            <p className="text-white/50 text-xs mt-0.5">Así te ven los clientes en la plataforma</p>
          </div>
          <a href={`/proveedor/${proveedor.id}`} target="_blank" className="flex items-center gap-2 bg-cl-verde text-white rounded-xl px-4 py-2 text-sm font-bold hover:bg-cl-verde2 transition-colors">
            <Eye size={14} /> Ver perfil
          </a>
        </div>

      </div>
      <Footer />
    </div>
  )
}
