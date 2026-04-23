'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Star, MessageCircle, X, MapPin, ExternalLink } from 'lucide-react'
import type { Proveedor } from '@/lib/types'

const CAT_COLORES: Record<string, { bg: string; text: string; hex: string }> = {
  'Peluquería':  { bg: 'bg-pink-500',   text: 'text-pink-500',   hex: '#ec4899' },
  'Barbería':    { bg: 'bg-blue-500',    text: 'text-blue-500',   hex: '#3b82f6' },
  'Uñas':        { bg: 'bg-purple-500',  text: 'text-purple-500', hex: '#a855f7' },
  'Masajes':     { bg: 'bg-green-500',   text: 'text-green-500',  hex: '#22c55e' },
  'Maquillaje':  { bg: 'bg-orange-500',  text: 'text-orange-500', hex: '#f97316' },
  'Faciales':    { bg: 'bg-teal-500',    text: 'text-teal-500',   hex: '#14b8a6' },
  'Depilación':  { bg: 'bg-red-500',     text: 'text-red-500',    hex: '#ef4444' },
  'Pestañas':    { bg: 'bg-indigo-500',  text: 'text-indigo-500', hex: '#6366f1' },
}

function getCat(cat: string) {
  return CAT_COLORES[cat] ?? { bg: 'bg-cl-verde', text: 'text-cl-verde', hex: '#5cbe8a' }
}

// v2 — sin leaflet — Bounds del mapa de Melbourne que vamos a mostrar
const MAP_BOUNDS = {
  latMin: -38.18,
  latMax: -37.55,
  lngMin: 144.55,
  lngMax: 145.40,
}

function latLngToPercent(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)) * 100
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 100
  return { x, y }
}

interface Props {
  proveedores: Proveedor[]
}

export default function MapaProveedores({ proveedores }: Props) {
  const [seleccionado, setSeleccionado] = useState<Proveedor | null>(null)
  const mapaRef = useRef<HTMLDivElement>(null)

  const conCoordenadas = proveedores.filter((p) => p.lat && p.lng)
  const categorias = Array.from(new Set(conCoordenadas.map((p) => p.cat).filter(Boolean)))

  // Cerrar tarjeta al hacer click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest('[data-pin]') && !target.closest('[data-card]')) {
        setSeleccionado(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative w-full h-full min-h-[520px] bg-[#e8f0e9] overflow-hidden rounded-none">

      {/* Mapa base via iframe sin marcadores */}
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAP_BOUNDS.lngMin},${MAP_BOUNDS.latMin},${MAP_BOUNDS.lngMax},${MAP_BOUNDS.latMax}&layer=mapnik`}
        className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
        title="Mapa Melbourne"
        loading="lazy"
      />

      {/* Capa SVG para pines — encima del iframe */}
      <div
        ref={mapaRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 10 }}
      >
        {conCoordenadas.map((p) => {
          const { x, y } = latLngToPercent(p.lat!, p.lng!)
          const color = getCat(p.cat)
          const esSeleccionado = seleccionado?.id === p.id

          return (
            <button
              key={p.id}
              data-pin
              onClick={(e) => {
                e.stopPropagation()
                setSeleccionado(esSeleccionado ? null : p)
              }}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-full transition-transform hover:scale-110 focus:outline-none"
              style={{ left: `${x}%`, top: `${y}%`, zIndex: esSeleccionado ? 30 : 20 }}
              title={p.nombre}
            >
              {/* Pin estilo Airbnb */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-lg border-2 transition-all whitespace-nowrap
                  ${esSeleccionado
                    ? 'bg-cl-dark text-cl-verde2 border-cl-dark scale-110'
                    : 'bg-white text-cl-dark border-white hover:border-cl-dark'
                  }`}
                style={{ fontSize: '0.7rem', fontWeight: 800 }}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                {p.nombre.split(' ')[0]}
              </div>
              {/* Sombra del pin */}
              <div className="w-2 h-1 bg-black/20 rounded-full mx-auto mt-0.5 blur-sm" />
            </button>
          )
        })}
      </div>

      {/* Tarjeta flotante estilo Airbnb al seleccionar un pin */}
      {seleccionado && (
        <div
          data-card
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[300px] bg-white rounded-2xl shadow-2xl border border-cl-gray-light overflow-hidden"
          style={{ zIndex: 40 }}
        >
          <div className="p-4">
            <button
              onClick={() => setSeleccionado(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-cl-bg hover:bg-cl-gray-light flex items-center justify-center transition-colors"
            >
              <X size={13} className="text-cl-gray" />
            </button>

            {/* Cabecera */}
            <div className="flex items-start gap-3 pr-8">
              <div
                className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-lg font-extrabold ${getCat(seleccionado.cat).bg}`}
              >
                {seleccionado.nombre?.charAt(0)}
              </div>
              <div>
                <p className="font-extrabold text-cl-dark text-sm leading-tight">{seleccionado.nombre}</p>
                <p className={`text-xs font-bold mt-0.5 ${getCat(seleccionado.cat).text}`}>{seleccionado.cat}</p>
                {seleccionado.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-cl-dark">{seleccionado.rating}</span>
                    {seleccionado.totalresenas && (
                      <span className="text-xs text-cl-gray">({seleccionado.totalresenas} reseñas)</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Direccion */}
            {seleccionado.direccion && (
              <div className="flex items-start gap-2 mt-3 bg-cl-bg rounded-xl p-2.5">
                <MapPin size={12} className="text-cl-verde mt-0.5 flex-shrink-0" />
                <p className="text-xs text-cl-gray leading-relaxed">{seleccionado.direccion}</p>
              </div>
            )}

            {/* Descripcion */}
            {seleccionado.descripcion && (
              <p className="text-xs text-cl-gray mt-2.5 leading-relaxed line-clamp-2">{seleccionado.descripcion}</p>
            )}

            {/* Horario */}
            {seleccionado.horario && (
              <p className="text-[0.65rem] text-cl-verde font-semibold mt-1.5">{seleccionado.horario}</p>
            )}

            {/* Botones */}
            <div className="flex gap-2 mt-3">
              <Link
                href={`/proveedor/${seleccionado.id}`}
                className="flex-1 bg-cl-dark text-cl-verde2 text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={11} />
                Ver perfil completo
              </Link>
              <a
                href={`https://wa.me/${seleccionado.telefono}?text=Hola! Te vi en Conectando Latinos Melbourne y me interesa tu servicio de ${seleccionado.cat}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#25d366] text-white text-xs font-bold rounded-xl px-3 py-2.5 hover:opacity-90 transition-opacity"
              >
                <MessageCircle size={12} />
                WA
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Leyenda de categorias */}
      {categorias.length > 0 && (
        <div
          className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 min-w-[130px]"
          style={{ zIndex: 20 }}
        >
          <p className="text-[0.6rem] font-extrabold text-cl-gray uppercase tracking-widest mb-2">Categorias</p>
          <div className="flex flex-col gap-1.5">
            {categorias.map((cat) => {
              const color = getCat(cat)
              const cantidad = conCoordenadas.filter((p) => p.cat === cat).length
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.hex }} />
                  <span className="text-[0.65rem] text-cl-dark font-semibold truncate">{cat}</span>
                  <span className="text-[0.6rem] text-cl-gray ml-auto">{cantidad}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mensaje sin coordenadas */}
      {conCoordenadas.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 20, pointerEvents: 'none' }}>
          <div className="bg-white/95 rounded-2xl px-6 py-5 shadow-xl text-center max-w-xs mx-4">
            <MapPin size={32} className="text-cl-gray/30 mx-auto mb-3" />
            <p className="text-cl-dark font-bold text-sm">Sin ubicaciones exactas aun</p>
            <p className="text-cl-gray text-xs mt-1 leading-relaxed">
              Los emprendedores apareceran en el mapa cuando registren su direccion exacta.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
