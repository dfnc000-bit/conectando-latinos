'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Plus } from 'lucide-react'
import { SUBURBIOS } from '@/lib/types'

const STATS = [
  { value: '80+', label: 'Proveedores activos' },
  { value: '11', label: 'Categorías' },
  { value: '10+', label: 'Suburbios' },
  { value: '4.9★', label: 'Calificación promedio' },
]

export function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suburb, setSuburb] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (suburb) params.set('suburb', suburb)
    router.push(`/servicios?${params.toString()}`)
  }

  return (
    <section className="bg-cl-dark relative overflow-hidden pt-20 pb-0 px-6 text-center">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 20% 80%, rgba(26,138,110,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(200,136,42,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] rounded-full px-4 py-1.5 mb-6">
          <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Melbourne, Australia</span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-cl-verde2 text-xs font-bold tracking-widest uppercase">Para la comunidad latina</span>
        </div>

        {/* Heading — 3 renglones: línea 1 normal / línea 2 verde / línea 3 con "ti" dorado */}
        <h1
          className="font-syne text-white font-extrabold leading-[1.06] tracking-tight mb-5 text-balance"
          style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)' }}
        >
          Servicios de belleza y bienestar<br />
          <span className="text-cl-verde2">en español</span>
          <br />
          cerca de <span className="text-cl-gold2">ti</span>
        </h1>

        {/* Subtítulo corto */}
        <p className="text-white/50 text-base leading-relaxed max-w-lg mx-auto mb-6">
          Profesionales latinos en Melbourne. Atención en tu idioma, contacto directo por WhatsApp.
        </p>

        {/* Prueba social — UNA sola vez aquí, NO se repite abajo */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
          <div className="flex items-center gap-1.5">
            <span className="text-cl-gold2 text-sm tracking-tight">★★★★★</span>
            <span className="text-white font-bold text-sm">4.9</span>
            <span className="text-white/40 text-xs">promedio</span>
          </div>
          <span className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-white font-bold text-sm">80+</span>
            <span className="text-white/40 text-xs">proveedores activos</span>
          </div>
          <span className="w-px h-3 bg-white/20" />
          <div className="flex items-center gap-1.5">
            <span className="text-cl-verde2 font-bold text-sm">Gratis</span>
            <span className="text-white/40 text-xs">para clientes</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex gap-3 justify-center flex-wrap mb-8">
          <button
            onClick={handleSearch}
            className="flex items-center gap-3 bg-white/[0.05] border border-cl-verde hover:bg-cl-verde transition-all rounded-2xl px-5 py-4 text-left min-w-[220px] text-white group"
          >
            <Search size={22} className="text-cl-verde2 group-hover:text-white flex-shrink-0 transition-colors" />
            <div>
              <p className="font-bold text-sm">Buscar un servicio</p>
              <p className="text-white/55 text-xs mt-0.5">Encuentra profesionales cerca tuyo</p>
            </div>
          </button>
          <a
            href="/registro?tab=proveedor"
            className="flex items-center gap-3 bg-white/[0.05] border border-white/[0.12] hover:border-cl-gold transition-all rounded-2xl px-5 py-4 text-left min-w-[220px] text-white group"
          >
            <Plus size={22} className="text-cl-gold2 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">¿Sos proveedor? Publicá gratis</p>
              <p className="text-white/55 text-xs mt-0.5">Publicá tu negocio hoy</p>
            </div>
          </a>
        </div>

        {/* Barra de búsqueda */}
        <div className="flex bg-white/[0.07] border border-white/[0.14] rounded-xl overflow-hidden focus-within:border-cl-verde2 transition-colors max-w-2xl mx-auto">
          <div className="flex items-center pl-4 text-white/30">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="¿Qué servicio buscás? Ej: Uñas, Corte, Masaje..."
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/35 font-jakarta text-sm px-3 py-3.5"
          />
          <div className="w-px bg-white/[0.12] my-2.5" />
          <div className="flex items-center px-1">
            <MapPin size={14} className="text-white/30 ml-2 mr-1 flex-shrink-0" />
            <select
              value={suburb}
              onChange={(e) => setSuburb(e.target.value)}
              className="bg-transparent border-none outline-none text-white/60 font-jakarta text-xs pr-2 py-3.5 cursor-pointer min-w-[140px]"
            >
              <option value="" className="bg-cl-dark text-white">Todos los suburbios</option>
              {SUBURBIOS.map((s) => (
                <option key={s} value={s} className="bg-cl-dark text-white">{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm px-6 transition-colors flex-shrink-0"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Stats — barra inferior SIN "80+" ni "4.9" para no repetir la prueba social de arriba */}
      <div className="relative z-10 mt-12 border-t border-white/[0.08]">
        <div className="max-w-3xl mx-auto grid grid-cols-4 divide-x divide-white/[0.08]">
          {STATS.map((s) => (
            <div key={s.label} className="text-center py-5 px-4">
              <p className="font-syne text-cl-verde2 text-2xl font-extrabold leading-none">{s.value}</p>
              <p className="text-white/40 text-xs mt-1.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}
