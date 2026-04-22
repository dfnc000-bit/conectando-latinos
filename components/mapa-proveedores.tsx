'use client'

import { useEffect, useState, useRef } from 'react'
import { MapPin, X, Star, MessageCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { Proveedor } from '@/lib/types'

// Coordenadas de Melbourne CBD como centro por defecto
const MELBOURNE_CENTER: [number, number] = [-37.8136, 144.9631]

interface Props {
  proveedores: Proveedor[]
}

export function MapaProveedores({ proveedores }: Props) {
  const mapRef = useRef<any>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [seleccionado, setSeleccionado] = useState<Proveedor | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !mapContainerRef.current || mapRef.current) return

    // Importar Leaflet de forma dinamica para evitar SSR errors
    import('leaflet').then((L) => {
      // Corregir los iconos de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapContainerRef.current!, {
        center: MELBOURNE_CENTER,
        zoom: 11,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19,
      }).addTo(map)

      // Agregar pines por cada proveedor con coordenadas
      proveedores.forEach((p) => {
        if (!p.lat || !p.lng) return

        // Pin personalizado estilo pill
        const pinHtml = `
          <div style="
            background: #141814;
            color: #9EE870;
            font-family: 'Syne', sans-serif;
            font-weight: 800;
            font-size: 11px;
            padding: 5px 10px;
            border-radius: 999px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
            border: 2px solid #9EE870;
            cursor: pointer;
            transition: all 0.15s;
          ">
            ${p.cat}
          </div>
        `

        const icon = L.divIcon({
          html: pinHtml,
          className: '',
          iconAnchor: [0, 0],
        })

        const marker = L.marker([p.lat, p.lng], { icon })
          .addTo(map)
          .on('click', () => {
            setSeleccionado(p)
            map.setView([p.lat! - 0.005, p.lng!], 14, { animate: true })
          })
      })

      mapRef.current = map
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [mounted, proveedores])

  if (!mounted) return (
    <div className="w-full h-full bg-cl-bg flex items-center justify-center">
      <div className="text-cl-gray text-sm font-semibold">Cargando mapa...</div>
    </div>
  )

  return (
    <div className="relative w-full h-full">
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />

      {/* Mapa */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Tarjeta flotante del proveedor seleccionado — estilo Airbnb */}
      {seleccionado && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-cl-gray-light">
            {/* Header con foto o gradiente */}
            <div
              className="h-28 w-full flex items-end p-3 relative"
              style={{ background: 'linear-gradient(135deg,#141814,#1a8a6e)' }}
            >
              <button
                onClick={() => setSeleccionado(null)}
                className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              >
                <X size={14} />
              </button>
              {seleccionado.fotoPerfil ? (
                <img
                  src={seleccionado.fotoPerfil}
                  alt={`Foto de ${seleccionado.nombre}`}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white/30"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center border-2 border-white/20">
                  <span className="text-white/60 text-2xl font-bold">{seleccionado.nombre.charAt(0)}</span>
                </div>
              )}
              <div className="ml-3 mb-1">
                <p className="text-white font-syne font-extrabold text-sm leading-tight">{seleccionado.nombre}</p>
                <span className="bg-cl-verde/80 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">{seleccionado.cat}</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span className="text-cl-dark font-bold text-sm">{seleccionado.rating?.toFixed(1)}</span>
                  <span className="text-cl-gray text-xs">({seleccionado.totalResenas} resenas)</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${seleccionado.disponible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {seleccionado.disponible ? 'Disponible' : 'No disponible'}
                </span>
              </div>

              {seleccionado.direccion && (
                <div className="flex items-start gap-1.5 mb-3">
                  <MapPin size={13} className="text-cl-verde mt-0.5 flex-shrink-0" />
                  <p className="text-cl-gray text-xs leading-tight">{seleccionado.direccion}</p>
                </div>
              )}

              <p className="text-cl-gray text-xs leading-relaxed mb-4 line-clamp-2">{seleccionado.descripcion}</p>

              <div className="flex gap-2">
                <Link
                  href={`/proveedor/${seleccionado.id}`}
                  className="flex-1 bg-cl-dark text-cl-verde2 text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                >
                  <ExternalLink size={12} />
                  Ver perfil completo
                </Link>
                {seleccionado.telefono && (
                  <a
                    href={`https://wa.me/${seleccionado.telefono}?text=Hola! Te vi en el mapa de Conectando Latinos y me interesa tu servicio de ${seleccionado.cat}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-[#25d366] text-white text-xs font-bold rounded-xl py-2.5 flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle size={12} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contador de pines */}
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-xl px-3 py-2 shadow-md border border-cl-gray-light">
        <p className="text-cl-dark text-xs font-bold">
          {proveedores.filter((p) => p.lat && p.lng).length} proveedores en el mapa
        </p>
      </div>
    </div>
  )
}
