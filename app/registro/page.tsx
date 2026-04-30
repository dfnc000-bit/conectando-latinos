'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Upload, X, Plus, Trash2 } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { registrarClienteAction, registrarProveedorAction, updateProveedorAction } from '@/lib/actions'
import { uploadProviderImage, geocodificarDireccion } from '@/lib/uploadImage'
import { setSesion } from '@/lib/store'
import { CATEGORIAS, SUBURBIOS, type Usuario } from '@/lib/types'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-cl-gray text-[0.7rem] font-bold uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function RegistroContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<'cliente' | 'proveedor'>(
    searchParams.get('tab') === 'proveedor' ? 'proveedor' : 'cliente'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  // ── Cliente ──────────────────────────────────────────
  const [cNombre, setCNombre] = useState('')
  const [cEmail, setCEmail] = useState('')
  const [cPassword, setCPassword] = useState('')
  const [cSuburb, setCSuburb] = useState('')
  const [cAceptaDatos, setCAceptaDatos] = useState(false)
  const [cAceptaPublicidad, setCAceptaPublicidad] = useState(false)

  // ── Proveedor ─────────────────────────────────────────
  const [pNegocio, setPNegocio] = useState('')
  const [pNombre, setPNombre] = useState('')
  const [pEmail, setPEmail] = useState('')
  const [pPassword, setPPassword] = useState('')
  const [pTel, setPTel] = useState('')
  const [pCat, setPCat] = useState('')
  const [pSuburb, setPSuburb] = useState('')
  const [pDesc, setPDesc] = useState('')
  const [pIg, setPIg] = useState('')
  const [pHorario, setPHorario] = useState('')
  const [pDireccion, setPDireccion] = useState('')
  const [pAceptaDatos, setPAceptaDatos] = useState(false)
  const [pAceptaPublicidad, setPAceptaPublicidad] = useState(false)

  const [fotoPerfil, setFotoPerfil] = useState<File | null>(null)
  const [fotoPerfilPreview, setFotoPerfilPreview] = useState('')
  const [galeria, setGaleria] = useState<File[]>([])
  const [galeriaPreview, setGaleriaPreview] = useState<string[]>([])
  const [servicios, setServicios] = useState([{ name: '', price: '' }])
  const fotoRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)

  function handleFotoPerfil(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setFotoPerfil(file)
      setFotoPerfilPreview(URL.createObjectURL(file))
    }
  }

  function handleGaleria(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const nuevas = files.slice(0, 9 - galeria.length)
    setGaleria((prev) => [...prev, ...nuevas])
    setGaleriaPreview((prev) => [...prev, ...nuevas.map((f) => URL.createObjectURL(f))].slice(0, 9))
  }

  async function registrarCliente() {
    if (!cNombre || !cEmail || !cPassword) { setError('Completá todos los campos obligatorios.'); return }
    if (cPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (!cAceptaDatos) { setError('Debés aceptar el tratamiento de datos para continuar.'); return }
    setLoading(true); setError('')
    const result = await registrarClienteAction({
      nombre: cNombre,
      email: cEmail,
      password: cPassword,
      suburb: cSuburb,
      aceptaPublicidad: cAceptaPublicidad,
    })
    if (result.error) { setError(result.error); setLoading(false); return }
    setExito('Cuenta creada. Revisá tu correo para confirmar y luego iniciá sesión.')
    setLoading(false)
  }

  async function registrarProveedor() {
    if (!pNegocio || !pNombre || !pEmail || !pPassword || !pTel || !pCat || !pSuburb || !pDesc) {
      setError('Completá todos los campos obligatorios.'); return
    }
    if (pPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (!pAceptaDatos) { setError('Debés aceptar el tratamiento de datos para continuar.'); return }
    setLoading(true); setError('')
    const result = await registrarProveedorAction({
      nombre: pNombre, nombreNegocio: pNegocio, email: pEmail, password: pPassword,
      telefono: pTel, instagram: pIg, cat: pCat, suburb: pSuburb,
      descripcion: pDesc, horario: pHorario, direccion: pDireccion,
      fotoPerfil: '', galeria: [],
      servicios: servicios.filter((s) => s.name.trim()),
      aceptaPublicidad: pAceptaPublicidad,
    })
    if (result.error) { setError(result.error); setLoading(false); return }

    const userId = result.userId || ''
    if (userId) {
      try {
        const updates: Record<string, any> = {}

        if (fotoPerfil) {
          const fotoUrl = await uploadProviderImage(fotoPerfil, userId, 0)
          updates.avatar_url = fotoUrl
        }

        const galeriaUrls: string[] = []
        for (let i = 0; i < galeria.length; i++) {
          const url = await uploadProviderImage(galeria[i], userId, i + 1)
          galeriaUrls.push(url)
        }
        if (galeriaUrls.length > 0) {
          updates.galeria = galeriaUrls
        }

        if (pDireccion) {
          const coords = await geocodificarDireccion(pDireccion)
          if (coords) {
            updates.lat = coords.lat
            updates.lng = coords.lng
          }
        }

        if (Object.keys(updates).length > 0 && result.proveedorId) {
          await updateProveedorAction(result.proveedorId, updates)
        }
      } catch (imgError) {
        console.error('Error subiendo imágenes:', imgError)
      }
    }

    const sesion: Usuario = {
      id: `u_${Date.now()}`, nombre: pNombre, email: pEmail,
      tipo: 'proveedor', suburb: pSuburb, fechaRegistro: new Date().toISOString().split('T')[0],
    }
    setSesion({ ...sesion, proveedorId: result.proveedorId } as any)
    setExito('Perfil creado. Revisá tu correo para confirmar tu cuenta.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-cl-bg">
      <Navbar />
      <div className="flex-1 py-12 px-4">
        <div className="max-w-xl mx-auto">
          <div className="bg-cl-dark rounded-t-3xl px-7 py-7">
            <h1 className="font-syne text-white font-extrabold text-2xl tracking-tight mb-1">Únete a Conectando Latinos</h1>
            <p className="text-white/50 text-sm">Melbourne te espera — el registro es completamente gratis</p>
          </div>
          <div className="bg-white rounded-b-3xl border border-t-0 border-cl-gray-light px-7 py-6 shadow-sm">
            <div className="flex bg-cl-bg rounded-xl p-1 mb-6">
              {(['cliente', 'proveedor'] as const).map((t) => (
                <button key={t} onClick={() => { setTab(t); setError(''); setExito('') }}
                  className={`flex-1 rounded-[0.625rem] py-2.5 text-xs font-bold transition-all ${tab === t ? 'bg-white text-cl-verde shadow-sm' : 'text-cl-gray hover:text-cl-dark'}`}>
                  {t === 'cliente' ? 'Soy cliente' : 'Soy proveedor'}
                </button>
              ))}
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl px-4 py-3 mb-4">{error}</div>}
            {exito && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl px-4 py-3 mb-4">
                {exito}
                <Link href="/login" className="ml-2 underline">Iniciar sesión</Link>
              </div>
            )}

            {/* ══════════════════ FORMULARIO CLIENTE ══════════════════ */}
            {tab === 'cliente' ? (
              <div className="flex flex-col gap-4">
                <Field label="Nombre completo *"><input className="form-input" value={cNombre} onChange={(e) => setCNombre(e.target.value)} placeholder="Tu nombre completo" /></Field>
                <Field label="Correo electrónico *"><input className="form-input" type="email" value={cEmail} onChange={(e) => setCEmail(e.target.value)} placeholder="tu@correo.com" /></Field>
                <Field label="Contraseña *"><input className="form-input" type="password" value={cPassword} onChange={(e) => setCPassword(e.target.value)} placeholder="Mínimo 6 caracteres" /></Field>
                <Field label="Tu suburbio en Melbourne">
                  <select className="form-input" value={cSuburb} onChange={(e) => setCSuburb(e.target.value)}>
                    <option value="">Seleccioná tu suburbio</option>
                    {SUBURBIOS.map((s) => <option key={s}>{s}</option>)}
                    <option>Otro</option>
                  </select>
                </Field>

                {/* ── Casillas de consentimiento ── */}
                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={cAceptaDatos}
                      onChange={(e) => setCAceptaDatos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-cl-verde flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-cl-gray leading-relaxed">
                      Acepto el{' '}
                      <Link href="/politica-privacidad" target="_blank" className="text-cl-verde font-semibold hover:underline">
                        tratamiento de mis datos personales
                      </Link>{' '}
                      según la política de privacidad. <span className="text-red-500 font-bold">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={cAceptaPublicidad}
                      onChange={(e) => setCAceptaPublicidad(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-cl-verde flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-cl-gray leading-relaxed">
                      Acepto recibir novedades, promociones y publicidad de Conectando Latinos al correo registrado. (Opcional)
                    </span>
                  </label>
                </div>

                <button onClick={registrarCliente} disabled={loading} className="w-full bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm rounded-xl py-3.5 mt-2 transition-colors disabled:opacity-60">
                  {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
                </button>
                <p className="text-center text-cl-gray text-xs">¿Ya tenés cuenta? <Link href="/login" className="text-cl-verde font-bold hover:underline">Iniciar sesión</Link></p>
              </div>

            ) : (
            /* ══════════════════ FORMULARIO PROVEEDOR ══════════════════ */
              <div className="flex flex-col gap-4">
                <Field label="Nombre del negocio *"><input className="form-input" value={pNegocio} onChange={(e) => setPNegocio(e.target.value)} placeholder="Ej: Barber Latino, Studio Ana..." /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Tu nombre *"><input className="form-input" value={pNombre} onChange={(e) => setPNombre(e.target.value)} placeholder="Nombre completo" /></Field>
                  <Field label="WhatsApp *"><input className="form-input" value={pTel} onChange={(e) => setPTel(e.target.value)} placeholder="+61 4XX XXX XXX" /></Field>
                </div>
                <Field label="Correo electrónico *"><input className="form-input" type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} placeholder="tu@correo.com" /></Field>
                <Field label="Contraseña *"><input className="form-input" type="password" value={pPassword} onChange={(e) => setPPassword(e.target.value)} placeholder="Mínimo 6 caracteres" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Categoría principal *">
                    <select className="form-input" value={pCat} onChange={(e) => setPCat(e.target.value)}>
                      <option value="">Seleccioná</option>
                      {CATEGORIAS.filter((c) => c.value !== 'todas').map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Suburbio donde atendés *">
                    <select className="form-input" value={pSuburb} onChange={(e) => setPSuburb(e.target.value)}>
                      <option value="">Seleccioná</option>
                      {SUBURBIOS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Horario de atención"><input className="form-input" value={pHorario} onChange={(e) => setPHorario(e.target.value)} placeholder="Ej: Lun–Sáb 9am–6pm" /></Field>
                <Field label="Dirección exacta donde atendés">
                  <input
                    className="form-input"
                    value={pDireccion}
                    onChange={(e) => setPDireccion(e.target.value)}
                    placeholder="Ej: 123 Barkly St, Footscray VIC 3011"
                  />
                  <p className="text-cl-gray/60 text-[0.65rem] mt-1">Esta dirección aparecerá en el mapa para que los clientes te encuentren fácilmente.</p>
                </Field>
                <Field label="Descripción de tus servicios *">
                  <textarea className="form-input resize-none min-h-[90px]" value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Contanos qué servicios ofrecés, tu experiencia y especialidades..." />
                </Field>
                <Field label="Instagram (opcional)"><input className="form-input" value={pIg} onChange={(e) => setPIg(e.target.value)} placeholder="@tunegocio" /></Field>

                <Field label="Foto de perfil">
                  <div onClick={() => fotoRef.current?.click()} className="border-2 border-dashed border-cl-gray-light rounded-xl p-5 text-center cursor-pointer hover:border-cl-verde transition-colors bg-cl-bg">
                    {fotoPerfil ? (
                      <div className="relative inline-block">
                        <img src={fotoPerfilPreview} alt="Preview foto de perfil" className="w-24 h-24 rounded-xl object-cover mx-auto" />
                        <button onClick={(e) => { e.stopPropagation(); setFotoPerfil(null); setFotoPerfilPreview('') }} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center"><X size={10} /></button>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-cl-gray mx-auto mb-2" />
                        <p className="text-cl-gray text-xs font-semibold">Subí tu foto de perfil</p>
                        <p className="text-cl-gray/60 text-xs">JPG, PNG — máx 5MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFotoPerfil} />
                </Field>

                <Field label={`Galería de trabajos (${galeria.length}/9)`}>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {galeriaPreview.map((img, i) => (
                      <div key={i} className="relative aspect-square">
                        <img src={img} alt={`Trabajo ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                        <button onClick={() => {
                          setGaleria((prev) => prev.filter((_, idx) => idx !== i))
                          setGaleriaPreview((prev) => prev.filter((_, idx) => idx !== i))
                        }} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center"><X size={9} /></button>
                      </div>
                    ))}
                    {galeria.length < 9 && (
                      <button onClick={() => galeriaRef.current?.click()} className="aspect-square border-2 border-dashed border-cl-gray-light rounded-xl flex flex-col items-center justify-center gap-1 text-cl-gray hover:border-cl-verde transition-colors bg-cl-bg">
                        <Plus size={18} />
                        <span className="text-xs font-semibold">Agregar</span>
                      </button>
                    )}
                  </div>
                  <input ref={galeriaRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGaleria} />
                </Field>

                <Field label="Servicios y precios">
                  <div className="flex flex-col gap-2 mb-2">
                    {servicios.map((s, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className="form-input flex-1" placeholder="Nombre del servicio" value={s.name} onChange={(e) => setServicios((prev) => prev.map((sv, idx) => idx === i ? { ...sv, name: e.target.value } : sv))} />
                        <input className="form-input w-28" placeholder="Precio AUD" value={s.price} onChange={(e) => setServicios((prev) => prev.map((sv, idx) => idx === i ? { ...sv, price: e.target.value } : sv))} />
                        {servicios.length > 1 && <button onClick={() => setServicios((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={15} /></button>}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setServicios((prev) => [...prev, { name: '', price: '' }])} className="flex items-center gap-1.5 text-cl-verde text-xs font-bold hover:text-cl-verde2 transition-colors">
                    <Plus size={13} /> Agregar servicio
                  </button>
                </Field>

                {/* ── Casillas de consentimiento ── */}
                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={pAceptaDatos}
                      onChange={(e) => setPAceptaDatos(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-cl-verde flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-cl-gray leading-relaxed">
                      Acepto el{' '}
                      <Link href="/politica-privacidad" target="_blank" className="text-cl-verde font-semibold hover:underline">
                        tratamiento de mis datos personales
                      </Link>{' '}
                      según la política de privacidad. <span className="text-red-500 font-bold">*</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={pAceptaPublicidad}
                      onChange={(e) => setPAceptaPublicidad(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-cl-verde flex-shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-cl-gray leading-relaxed">
                      Acepto recibir novedades, promociones y publicidad de Conectando Latinos al correo registrado. (Opcional)
                    </span>
                  </label>
                </div>

                <button onClick={registrarProveedor} disabled={loading} className="w-full bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm rounded-xl py-3.5 mt-2 transition-colors disabled:opacity-60">
                  {loading ? 'Publicando...' : 'Publicar mi negocio gratis'}
                </button>
                <p className="text-center text-cl-gray text-xs">Tu perfil sera revisado por el administrador antes de aparecer en el directorio.</p>
                <p className="text-center text-cl-gray text-xs">¿Ya tenés cuenta? <Link href="/login" className="text-cl-verde font-bold hover:underline">Iniciar sesión</Link></p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-cl-gray">Cargando...</p></div>}>
      <RegistroContent />
    </Suspense>
  )
}
