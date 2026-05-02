'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Star, MessageCircle, X, MapPin, ExternalLink } from 'lucide-react'
import type { Proveedor } from '@/lib/types'

const CAT_COLORES: Record<string, { hex: string }> = {
  'Peluquería':  { hex: '#ec4899' },
  'Barbería':    { hex: '#3b82f6' },
  'Uñas':        { hex: '#a855f7' },
  'Masajes':     { hex: '#22c55e' },
  'Maquillaje':  { hex: '#f97316' },
  'Faciales':    { hex: '#14b8a6' },
  'Depilación':  { hex: '#ef4444' },
  'Pestañas':    { hex: '#6366f1' },
}

function getCatColor(cat: string) {
  return CAT_COLORES[cat]?.hex ?? '#1a8a6e'
}

interface Props {
  proveedores: Proveedor[]
}

export default function MapaProveedores({ proveedores }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [seleccionado, setSeleccionado] = useState<Proveedor | null>(null)

  const conCoordenadas = proveedores.filter((p) => p.lat && p.lng)
  const categorias = Array.from(new Set(conCoordenadas.flatMap((p) => p.cat).filter(Boolean)))

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Cargar Leaflet dinámicamente
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      const L = (window as any).L
      if (!mapRef.current || mapInstanceRef.current) return

      const map = L.map(mapRef.current, {
        center: [-37.8136, 144.9631],
        zoom: 11,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

     mapInstanceRef.current = map
      setMapaListo(true)
    }
    document.head.appendChild(script)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Actualizar marcadores cuando cambian los proveedores
  const [mapaListo, setMapaListo] = useState(false)

  useEffect(() => {
    const map = mapInstanceRef.current
    const L = (window as any).L
    if (!map || !L || !mapaListo) return

    // Limpiar marcadores anteriores
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    conCoordenadas.forEach((p) => {
      const color = getCatColor(p.cat[0])
      const nombre = p.nombre.split(' ')[0]

      const icon = L.divIcon({
        className: '',
        html: `
          <div style="
            display: flex; align-items: center; gap: 5px;
            background: white; border: 2px solid white;
            padding: 5px 10px; border-radius: 999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            font-size: 11px; font-weight: 800;
            color: #1a1a2e; white-space: nowrap;
            cursor: pointer;
          ">
            <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block;"></span>
            ${nombre}
          </div>
          <div style="width:8px;height:4px;background:rgba(0,0,0,0.15);border-radius:50%;margin:2px auto 0;filter:blur(1px);"></div>
        `,
        iconAnchor: [40, 36],
      })

      const marker = L.marker([p.lat, p.lng], { icon })
        .addTo(map)
        .on('click', () => setSeleccionado((prev) => prev?.id === p.id ? null : p))

      markersRef.current.push(marker)
    })
 }, [proveedores, mapaListo])

  return (
    <div className="relative w-full h-full min-h-[520px]">
      <div ref={mapRef} className="absolute inset-0 w-full h-full" />

      {/* Leyenda */}
      {categorias.length > 0 && (
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg p-3 min-w-[130px]" style={{ zIndex: 1000 }}>
          <p className="text-[0.6rem] font-extrabold text-cl-gray uppercase tracking-widest mb-2">Categorias</p>
          <div className="flex flex-col gap-1.5">
            {categorias.map((cat) => (
              <div key={cat} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: getCatColor(cat) }} />
                <span className="text-[0.65rem] text-cl-dark font-semibold truncate">{cat}</span>
                <span className="text-[0.6rem] text-cl-gray ml-auto">{conCoordenadas.filter((p) => p.cat.includes(cat)).length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjeta al seleccionar */}
      {seleccionado && (
        <div
          data-card
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[300px] bg-white rounded-2xl shadow-2xl border border-cl-gray-light overflow-hidden"
          style={{ zIndex: 1000 }}
        >
          <div className="p-4">
            <button
              onClick={() => setSeleccionado(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-cl-bg hover:bg-cl-gray-light flex items-center justify-center transition-colors"
            >
              <X size={13} className="text-cl-gray" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <div
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-lg font-extrabold"
                style={{ backgroundColor: getCatColor(seleccionado.cat[0]) }}
              >
                {seleccionado.nombre?.charAt(0)}
              </div>
              <div>
                <p className="font-extrabold text-cl-dark text-sm leading-tight">{seleccionado.nombre}</p>
                <p className="text-xs font-bold mt-0.5" style={{ color: getCatColor(seleccionado.cat[0]) }}>{seleccionado.cat[0]}</p>
                {seleccionado.rating && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-cl-dark">{seleccionado.rating}</span>
                    {seleccionado.totalResenas && (
                      <span className="text-xs text-cl-gray">({seleccionado.totalResenas} reseñas)</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {seleccionado.direccion && (
              <div className="flex items-start gap-2 mt-3 bg-cl-bg rounded-xl p-2.5">
                <MapPin size={12} className="text-cl-verde mt-0.5 flex-shrink-0" />
                <p className="text-xs text-cl-gray leading-relaxed">{seleccionado.direccion}</p>
              </div>
            )}
            {seleccionado.descripcion && (
              <p className="text-xs text-cl-gray mt-2.5 leading-relaxed line-clamp-2">{seleccionado.descripcion}</p>
            )}
            {seleccionado.horario && (
              <p className="text-[0.65rem] text-cl-verde font-semibold mt-1.5">{seleccionado.horario}</p>
            )}
            <div className="flex gap-2 mt-3">
              <Link
                href={`/proveedor/${seleccionado.id}`}
                className="flex-1 bg-cl-dark text-cl-verde2 text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <ExternalLink size={11} />
                Ver perfil completo
              </Link>
              
               <a href={`https://wa.me/${seleccionado.telefono}?text=Hola! Te vi en Conectando Latinos Melbourne y me interesa tu servicio de ${seleccionado.cat[0]}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white text-xs font-bold rounded-xl px-3 py-2.5 hover:opacity-90 transition-opacity" style={{ backgroundColor: '#25d366' }}><MessageCircle size={12} />WA</a>
            </div>
          </div>
        </div>
      )}

      {conCoordenadas.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 1000, pointerEvents: 'none' }}>
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
