'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProviderCard } from '@/components/provider-card'
import { ChatWidget } from '@/components/chat-widget'
import { CATEGORIAS, SUBURBIOS, type Proveedor } from '@/lib/types'
import { getProveedoresAction } from '@/lib/actions'

function ServiciosContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [catActiva, setCatActiva] = useState(searchParams.get('cat') || 'todas')
  const [suburbio, setSuburbio] = useState(searchParams.get('suburb') || '')
  const [soloDisponibles, setSoloDisponibles] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    getProveedoresAction().then((data) => {
      // Mapear campos de Supabase al tipo Proveedor local
      setProveedores(data.map((p: any) => ({
        ...p,
        nombreNegocio: p.nombre,
        totalResenas: p.total_resenas ?? 0,
        fotoPerfil: p.avatar_url ?? '',
        servicios: (p.servicios ?? []).map((s: any) => ({ name: s.nombre, price: s.precio })),
        resenas: [],
        fechaRegistro: p.fecha_registro ?? '',
      })))
    })
  }, [])

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (catActiva !== 'todas') params.set('cat', catActiva)
    if (suburbio) params.set('suburb', suburbio)
    router.replace(`/servicios?${params.toString()}`, { scroll: false })
  }, [query, catActiva, suburbio])

  const filtrados = useMemo(() => {
    return proveedores.filter((p) => {
      const matchCat = catActiva === 'todas' || p.cat === catActiva
      const matchQ = !query || [p.nombreNegocio, p.nombre, p.cat, p.descripcion]
        .join(' ').toLowerCase().includes(query.toLowerCase())
      const matchSub = !suburbio || p.suburb === suburbio
      const matchDisp = !soloDisponibles || p.disponible
      return matchCat && matchQ && matchSub && matchDisp
    })
  }, [proveedores, query, catActiva, suburbio, soloDisponibles])

  function limpiarFiltros() {
    setQuery('')
    setCatActiva('todas')
    setSuburbio('')
    setSoloDisponibles(false)
  }

  const hayFiltros = query || catActiva !== 'todas' || suburbio || soloDisponibles

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Page header */}
      <div className="bg-cl-dark px-6 py-10">
        <div className="max-w-[1200px] mx-auto">
          <p className="text-cl-verde2 text-xs font-bold tracking-[2.5px] uppercase mb-2">Directorio verificado</p>
          <h1 className="font-syne text-white font-extrabold text-3xl tracking-tight mb-6">
            Encontrá tu especialista
          </h1>

          {/* Search bar */}
          <div className="flex bg-white/[0.07] border border-white/[0.14] rounded-xl overflow-hidden focus-within:border-cl-verde2 transition-colors max-w-2xl">
            <div className="flex items-center pl-4 text-white/30">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar servicio, nombre de negocio..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/35 font-jakarta text-sm px-3 py-3"
            />
            {query && (
              <button onClick={() => setQuery('')} className="pr-3 text-white/40 hover:text-white">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-8">
        {/* Filter row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Categoria pills */}
          <div className="flex gap-2 flex-wrap flex-1">
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCatActiva(cat.value)}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all ${
                  catActiva === cat.value
                    ? 'bg-cl-dark border-cl-dark text-cl-verde2'
                    : 'bg-white border-cl-gray-light text-cl-gray hover:border-cl-dark hover:text-cl-dark'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Side filters toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 border border-cl-gray-light bg-white rounded-xl px-3.5 py-2 text-xs font-bold text-cl-dark hover:border-cl-dark transition-all flex-shrink-0"
          >
            <SlidersHorizontal size={13} />
            Filtros
            {hayFiltros && (
              <span className="bg-cl-verde text-white rounded-full w-4 h-4 flex items-center justify-center text-[0.6rem]">!</span>
            )}
          </button>
        </div>

        {/* Extra filters panel */}
        {filtersOpen && (
          <div className="bg-white border border-cl-gray-light rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[180px]">
              <label className="block text-cl-gray text-[0.7rem] font-bold uppercase tracking-wider mb-1.5">Suburbio</label>
              <div className="flex items-center gap-2 border border-cl-gray-light rounded-xl px-3 py-2.5 bg-cl-bg">
                <MapPin size={13} className="text-cl-gray flex-shrink-0" />
                <select
                  value={suburbio}
                  onChange={(e) => setSuburbio(e.target.value)}
                  className="bg-transparent outline-none text-sm text-cl-dark font-jakarta w-full cursor-pointer"
                >
                  <option value="">Todos los suburbios</option>
                  {SUBURBIOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer min-w-[180px]">
              <div
                onClick={() => setSoloDisponibles(!soloDisponibles)}
                className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 flex items-center ${
                  soloDisponibles ? 'bg-cl-verde' : 'bg-cl-gray-light'
                }`}
              >
                <span className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${soloDisponibles ? 'translate-x-5' : ''}`} />
              </div>
              <span className="text-sm font-semibold text-cl-dark">Solo disponibles ahora</span>
            </label>

            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-1.5 text-cl-gray hover:text-red-500 text-xs font-bold transition-colors"
              >
                <X size={13} />
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-cl-gray text-sm">
            <span className="font-bold text-cl-dark">{filtrados.length}</span>{' '}
            proveedor{filtrados.length !== 1 ? 'es' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}
            {catActiva !== 'todas' && <span className="text-cl-verde font-semibold"> en {catActiva}</span>}
            {suburbio && <span className="text-cl-verde font-semibold"> · {suburbio}</span>}
          </p>
        </div>

        {/* Grid */}
        {filtrados.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-syne font-bold text-cl-dark text-lg mb-2">Sin resultados</p>
            <p className="text-cl-gray text-sm mb-5">No encontramos proveedores con esos filtros.</p>
            <button
              onClick={limpiarFiltros}
              className="bg-cl-verde text-white font-bold text-sm rounded-xl px-6 py-3 hover:bg-cl-verde2 transition-colors"
            >
              Ver todos los proveedores
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtrados.map((p, i) => (
              <ProviderCard key={p.id} proveedor={p} index={i} />
            ))}
          </div>
        )}
      </div>

      <Footer />
      <ChatWidget />
    </div>
  )
}
export default function ServiciosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-cl-gray">Cargando...</p></div>}>
      <ServiciosContent />
    </Suspense>
  )
}
