'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, X, Upload, Eye, Star, CheckCircle, Clock, Save, MessageCircle, TrendingUp, Calendar } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getSesion } from '@/lib/store'
import { CATEGORIAS, SUBURBIOS, type Proveedor } from '@/lib/types'
import { getProveedorByUserAction, updateProveedorAction, updateServiciosAction, getResumenClicksAction } from '@/lib/actions'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-cl-gray text-[0.7rem] font-bold uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'perfil' | 'servicios' | 'galeria' | 'estadisticas'>('perfil')
  const [clicks, setClicks] = useState({ total: 0, esteMes: 0, semanaActual: 0 })
  const fotoRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const sesion = getSesion()
    if (!sesion || sesion.tipo === 'admin') { router.push('/login'); return }
    getProveedorByUserAction().then((data) => {
      if (!data) return
      setProveedor({
        ...data,
        nombreNegocio: data.nombre,
        totalResenas: data.total_resenas ?? 0,
        fotoPerfil: data.avatar_url ?? '',
        servicios: (data.servicios ?? []).map((s: any) => ({ name: s.nombre, price: s.precio })),
        galeria: data.galeria ?? [],
        resenas: [],
        fechaRegistro: data.fecha_registro ?? '',
      })
      getResumenClicksAction(data.id).then(setClicks)
    })
  }, [router])

  function update<K extends keyof Proveedor>(key: K, value: Proveedor[K]) {
    setProveedor((prev) => prev ? { ...prev, [key]: value } : prev)
  }

  async function guardar() {
    if (!proveedor) return
    await updateProveedorAction(proveedor.id, {
      nombre: proveedor.nombre,
      telefono: proveedor.telefono,
      instagram: proveedor.instagram,
      cat: proveedor.cat,
      suburb: proveedor.suburb,
      descripcion: proveedor.descripcion,
      horario: proveedor.horario,
      disponible: proveedor.disponible,
      avatar_url: proveedor.fotoPerfil,
      galeria: proveedor.galeria,
    })
    await updateServiciosAction(proveedor.id, proveedor.servicios)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((res) => {
      const reader = new FileReader()
      reader.onload = (e) => res(e.target?.result as string)
      reader.readAsDataURL(file)
    })
  }

  async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) update('fotoPerfil', await fileToBase64(file))
  }

  async function handleGaleria(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const b64s = await Promise.all(files.map(fileToBase64))
    update('galeria', [...(proveedor?.galeria || []), ...b64s].slice(0, 9))
  }

  function addServicio() {
    update('servicios', [...(proveedor?.servicios || []), { name: '', price: '' }])
  }

  function updateServicio(i: number, field: 'name' | 'price', val: string) {
    const updated = (proveedor?.servicios || []).map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    )
    update('servicios', updated)
  }

  function removeServicio(i: number) {
    update('servicios', (proveedor?.servicios || []).filter((_, idx) => idx !== i))
  }

  if (!proveedor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-cl-gray text-sm">Cargando tu perfil...</div>
        </div>
      </div>
    )
  }

  const estadoInfo = {
    aprobado: { label: 'Perfil aprobado y visible', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle },
    pendiente: { label: 'Pendiente de revisión por el administrador', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock },
    rechazado: { label: 'Perfil rechazado — contactá al administrador', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: X },
  }[proveedor.estado]

  return (
    <div className="min-h-screen flex flex-col bg-cl-bg">
      <Navbar />

      <div className="bg-cl-dark px-6 py-8">
        <div className="max-w-[900px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-cl-verde2 text-xs font-bold tracking-[2.5px] uppercase mb-1">Panel de proveedor</p>
            <h1 className="font-syne text-white font-extrabold text-2xl tracking-tight">{proveedor.nombreNegocio}</h1>
          </div>
          <div className="flex gap-3">
            {proveedor.estado === 'aprobado' && (
              <Link
                href={`/proveedor/${proveedor.id}`}
                className="flex items-center gap-2 border border-white/25 text-white/80 hover:border-cl-verde2 hover:text-cl-verde2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all"
              >
                <Eye size={13} />
                Ver mi perfil
              </Link>
            )}
            <button
              onClick={guardar}
              className="flex items-center gap-2 bg-cl-verde hover:bg-cl-verde2 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-colors"
            >
              <Save size={13} />
              {saved ? 'Guardado!' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto w-full px-4 md:px-6 py-6">
        {/* Estado badge */}
        <div className={`flex items-center gap-2.5 border rounded-xl px-4 py-3 mb-6 ${estadoInfo.bg}`}>
          <estadoInfo.icon size={15} className={estadoInfo.color} />
          <span className={`text-sm font-semibold ${estadoInfo.color}`}>{estadoInfo.label}</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Calificación', value: proveedor.rating ? proveedor.rating.toFixed(1) + ' ★' : 'Sin reseñas' },
            { label: 'Reseñas totales', value: proveedor.totalResenas.toString() },
            { label: 'Servicios listados', value: proveedor.servicios.filter((s) => s.name).length.toString() },
            { label: 'Fotos en galería', value: proveedor.galeria.length.toString() },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-cl-gray-light rounded-xl p-4">
              <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="font-syne font-extrabold text-cl-dark text-lg">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-cl-gray-light rounded-xl p-1 mb-6 gap-1 flex-wrap">
          {([
            { key: 'perfil', label: 'Información' },
            { key: 'servicios', label: 'Servicios y precios' },
            { key: 'galeria', label: 'Galería de fotos' },
            { key: 'estadisticas', label: 'Estadísticas' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 rounded-[0.5rem] py-2.5 text-xs font-bold transition-all ${
                activeTab === t.key ? 'bg-cl-dark text-cl-verde2 shadow-sm' : 'text-cl-gray hover:text-cl-dark'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-cl-gray-light rounded-2xl p-5 md:p-6">
          {activeTab === 'perfil' && (
            <div className="flex flex-col gap-4">
              {/* Foto de perfil */}
              <Field label="Foto de perfil / portada">
                <div
                  onClick={() => fotoRef.current?.click()}
                  className="border-2 border-dashed border-cl-gray-light rounded-xl p-5 text-center cursor-pointer hover:border-cl-verde transition-colors bg-cl-bg"
                >
                  {proveedor.fotoPerfil ? (
                    <div className="relative inline-block">
                      <img src={proveedor.fotoPerfil} alt="Perfil" className="w-28 h-28 rounded-xl object-cover mx-auto" />
                      <button
                        onClick={(e) => { e.stopPropagation(); update('fotoPerfil', '') }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-cl-gray mx-auto mb-2" />
                      <p className="text-cl-gray text-xs font-semibold">Subí o cambiá tu foto</p>
                    </>
                  )}
                </div>
                <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nombre del negocio">
                  <input className="form-input" value={proveedor.nombreNegocio} onChange={(e) => update('nombreNegocio', e.target.value)} />
                </Field>
                <Field label="Tu nombre">
                  <input className="form-input" value={proveedor.nombre} onChange={(e) => update('nombre', e.target.value)} />
                </Field>
                <Field label="WhatsApp">
                  <input className="form-input" value={proveedor.telefono} onChange={(e) => update('telefono', e.target.value)} />
                </Field>
                <Field label="Instagram">
                  <input className="form-input" value={proveedor.instagram} onChange={(e) => update('instagram', e.target.value)} placeholder="@tunegocio" />
                </Field>
                <Field label="Categoría">
                  <select className="form-input" value={proveedor.cat} onChange={(e) => update('cat', e.target.value)}>
                    {CATEGORIAS.filter((c) => c.value !== 'todas').map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Suburbio">
                  <select className="form-input" value={proveedor.suburb} onChange={(e) => update('suburb', e.target.value)}>
                    {SUBURBIOS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Horario">
                  <input className="form-input" value={proveedor.horario} onChange={(e) => update('horario', e.target.value)} placeholder="Ej: Lun–Sáb 9am–6pm" />
                </Field>
                <Field label="Disponible ahora">
                  <div className="flex items-center gap-3 h-[42px]">
                    <button
                      onClick={() => update('disponible', !proveedor.disponible)}
                      className={`w-11 h-6 rounded-full transition-colors flex items-center ${proveedor.disponible ? 'bg-cl-verde' : 'bg-cl-gray-light'}`}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${proveedor.disponible ? 'translate-x-5' : ''}`} />
                    </button>
                    <span className="text-sm font-semibold text-cl-dark">
                      {proveedor.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>
                </Field>
              </div>
              <Field label="Descripción">
                <textarea
                  className="form-input resize-none min-h-[100px]"
                  value={proveedor.descripcion}
                  onChange={(e) => update('descripcion', e.target.value)}
                  placeholder="Describí tus servicios, experiencia y especialidades..."
                />
              </Field>
            </div>
          )}

          {activeTab === 'servicios' && (
            <div className="flex flex-col gap-3">
              <p className="text-cl-gray text-xs mb-2">Agregá los servicios que ofrecés con sus precios en AUD.</p>
              {proveedor.servicios.map((s, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    className="form-input flex-1"
                    placeholder="Nombre del servicio"
                    value={s.name}
                    onChange={(e) => updateServicio(i, 'name', e.target.value)}
                  />
                  <input
                    className="form-input w-32"
                    placeholder="Precio AUD"
                    value={s.price}
                    onChange={(e) => updateServicio(i, 'price', e.target.value)}
                  />
                  <button onClick={() => removeServicio(i)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              <button
                onClick={addServicio}
                className="flex items-center gap-1.5 text-cl-verde text-xs font-bold hover:text-cl-verde2 transition-colors mt-1"
              >
                <Plus size={13} />
                Agregar servicio
              </button>
            </div>
          )}

          {activeTab === 'galeria' && (
            <div>
              <p className="text-cl-gray text-xs mb-4">Subí fotos de tus trabajos para que los clientes vean tu trabajo ({proveedor.galeria.length}/9).</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {proveedor.galeria.map((img, i) => (
                  <div key={i} className="relative aspect-square">
                    <img src={img} alt={`Trabajo ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                    <button
                      onClick={() => update('galeria', proveedor.galeria.filter((_, idx) => idx !== i))}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
                {proveedor.galeria.length < 9 && (
                  <button
                    onClick={() => galeriaRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-cl-gray-light rounded-xl flex flex-col items-center justify-center gap-1 text-cl-gray hover:border-cl-verde transition-colors bg-cl-bg"
                  >
                    <Plus size={20} />
                    <span className="text-xs font-semibold">Agregar fotos</span>
                  </button>
                )}
              </div>
              <input ref={galeriaRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGaleria} />
            </div>
          )}

          {activeTab === 'estadisticas' && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="font-syne font-bold text-cl-dark text-base mb-1">Contactos via WhatsApp</h2>
                <p className="text-cl-gray text-xs">Cada vez que un cliente toca el boton de WhatsApp en tu perfil, lo registramos aqui para que veas el impacto de la plataforma.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#25d366]/10 border border-[#25d366]/30 rounded-xl p-4 text-center">
                  <MessageCircle size={20} className="text-[#25d366] mx-auto mb-2" />
                  <p className="font-syne font-extrabold text-cl-dark text-2xl">{clicks.total}</p>
                  <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mt-1">Total historico</p>
                </div>
                <div className="bg-cl-verde/10 border border-cl-verde/30 rounded-xl p-4 text-center">
                  <Calendar size={20} className="text-cl-verde mx-auto mb-2" />
                  <p className="font-syne font-extrabold text-cl-dark text-2xl">{clicks.esteMes}</p>
                  <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mt-1">Este mes</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <TrendingUp size={20} className="text-amber-500 mx-auto mb-2" />
                  <p className="font-syne font-extrabold text-cl-dark text-2xl">{clicks.semanaActual}</p>
                  <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mt-1">Ultimos 7 dias</p>
                </div>
              </div>

              <div className="bg-cl-bg border border-cl-gray-light rounded-xl p-4">
                <p className="text-cl-gray text-xs leading-relaxed">
                  Cada click al boton de WhatsApp representa un cliente potencial que quiso contactarte directamente desde la plataforma.
                  Estos datos te ayudan a ver el valor real de tu presencia en Conectando Latinos Melbourne.
                </p>
              </div>
            </div>
          )}

          {activeTab !== 'estadisticas' && (
          <div className="mt-6 pt-5 border-t border-cl-gray-light flex justify-end">
            <button
              onClick={guardar}
              className="flex items-center gap-2 bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm rounded-xl px-6 py-3 transition-colors"
            >
              <Save size={14} />
              {saved ? 'Cambios guardados!' : 'Guardar cambios'}
            </button>
          </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
