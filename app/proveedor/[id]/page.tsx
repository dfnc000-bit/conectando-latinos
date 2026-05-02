'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Clock, Star, MessageCircle, Instagram,
  ArrowLeft, CheckCircle, Phone, Share2
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProviderCard } from '@/components/provider-card'
import { ChatWidget } from '@/components/chat-widget'
import { gradForCat, iconForCat, type Proveedor } from '@/lib/types'
import { getProveedorByIdAction, getProveedoresAction, registrarClickWhatsappAction } from '@/lib/actions'

export default function PerfilPage() {
  const { id } = useParams<{ id: string }>()
  const [proveedor, setProveedor] = useState<Proveedor | null>(null)
  const [relacionados, setRelacionados] = useState<Proveedor[]>([])
  const [galeriaIdx, setGaleriaIdx] = useState<number | null>(null)

  useEffect(() => {
    getProveedorByIdAction(id).then((data) => {
      if (!data) return
      const mapped: Proveedor = {
        ...data,
        nombreNegocio: data.nombre,
        totalResenas: data.totalresenas ?? 0,
        fotoPerfil: data.avatar_url ?? '',
        servicios: (data.servicios ?? []).map((s: any) => ({ name: s.nombre, price: s.precio })),
        resenas: (data.resenas ?? []).map((r: any) => ({
          id: r.id, autor: r.nombre_usuario, rating: r.rating,
          comentario: r.comentario, fecha: r.fecha?.split('T')[0] ?? '',
        })),
        fechaRegistro: data.fecha_registro ?? '',
      }
      setProveedor(mapped)
      getProveedoresAction({ cat: data.cat }).then((rel) => {
        setRelacionados(
          rel.filter((r: any) => r.id !== id).slice(0, 3).map((r: any) => ({
            ...r, nombreNegocio: r.nombre, totalResenas: r.total_resenas ?? 0,
            fotoPerfil: r.avatar_url ?? '', servicios: [], resenas: [], fechaRegistro: r.fecha_registro ?? '',
          }))
        )
      })
    })
  }, [id])

  function handleWhatsapp(fuente: string = 'perfil') {
    registrarClickWhatsappAction(id, fuente)
  }

  function compartir() {
    if (navigator.share) {
      navigator.share({ title: proveedor?.nombreNegocio, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado!')
    }
  }

  if (!proveedor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col gap-4 py-24">
          <p className="font-syne font-bold text-cl-dark text-xl">Proveedor no encontrado</p>
          <Link href="/servicios" className="bg-cl-verde text-white font-bold text-sm rounded-xl px-5 py-2.5 hover:bg-cl-verde2 transition-colors">
            Ver todos los servicios
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const grad = gradForCat(proveedor.cat[0])
  const icon = iconForCat(proveedor.cat[0])

  return (
    <div className="min-h-screen flex flex-col bg-cl-bg">
      <Navbar />

      {/* Cover */}
      <div className="h-56 md:h-72 relative" style={{ background: grad }}>
        {proveedor.fotoPerfil && (
          <img src={proveedor.fotoPerfil} alt="Portada" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Back button */}
        <Link
          href="/servicios"
          className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-xl px-3 py-2 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver
        </Link>

        {/* Share */}
        <button
          onClick={compartir}
          className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          aria-label="Compartir"
        >
          <Share2 size={15} />
        </button>

        {/* Status badge */}
        <div className={`absolute bottom-4 right-4 text-xs font-bold rounded-xl px-3 py-1.5 backdrop-blur-sm ${proveedor.disponible ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
          {proveedor.disponible ? '● Disponible ahora' : '● No disponible'}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto w-full px-4 md:px-6 pb-16">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-cl-gray-light -mt-8 relative z-10 p-5 md:p-7 mb-5 shadow-sm">
          <div className="flex items-end gap-4 -mt-16 mb-5">
            <div className="w-24 h-24 rounded-2xl border-4 border-white bg-cl-bg2 flex items-center justify-center text-4xl shadow-lg flex-shrink-0 overflow-hidden">
              {proveedor.fotoPerfil ? (
                <img src={proveedor.fotoPerfil} alt={proveedor.nombre} className="w-full h-full object-cover" />
              ) : (
                <span>{icon}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="bg-cl-verde/10 border border-cl-verde text-cl-verde text-xs font-bold rounded-lg px-2.5 py-1 flex items-center gap-1">
                  <CheckCircle size={11} />
                  Verificado/a
                </span>
                <span className="bg-cl-bg border border-cl-gray-light text-cl-gray text-xs font-bold rounded-lg px-2.5 py-1">
                  {proveedor.cat.join(' · ')}
                </span>
              </div>
              <h1 className="font-syne font-extrabold text-cl-dark text-xl md:text-2xl tracking-tight leading-tight">
                {proveedor.nombreNegocio}
              </h1>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            <div className="bg-cl-bg rounded-xl p-3 border border-cl-gray-light">
              <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mb-1">Calificación</p>
              <div className="flex items-center gap-1">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="font-bold text-sm text-cl-dark">{proveedor.rating.toFixed(1)}</span>
                <span className="text-cl-gray text-xs">· {proveedor.totalResenas}</span>
              </div>
            </div>
            <div className="bg-cl-bg rounded-xl p-3 border border-cl-gray-light">
              <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mb-1">Suburbio</p>
              <div className="flex items-center gap-1">
                <MapPin size={12} className="text-cl-verde flex-shrink-0" />
                <span className="font-semibold text-sm text-cl-verde2 truncate">{proveedor.suburb}</span>
              </div>
            </div>
            <div className="bg-cl-bg rounded-xl p-3 border border-cl-gray-light">
              <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mb-1">Horario</p>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-cl-verde flex-shrink-0" />
                <span className="font-semibold text-xs text-cl-verde2">{proveedor.horario}</span>
              </div>
            </div>
            <div className="bg-cl-bg rounded-xl p-3 border border-cl-gray-light">
              <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mb-1">Categoría</p>
              <p className="font-semibold text-sm text-cl-verde">{proveedor.cat.join(' · ')}</p>
            </div>
          </div>

          <p className="text-cl-gray text-sm leading-relaxed mb-6">{proveedor.descripcion}</p>

          {/* CTA buttons */}
          <div className="flex gap-3 flex-wrap">
            <a
              href={`https://wa.me/${proveedor.telefono}?text=Hola! Te vi en Conectando Latinos Melbourne y me interesa tu servicio de ${proveedor.cat[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleWhatsapp('perfil')}
              className="flex-1 min-w-[140px] bg-[#25d366] hover:opacity-90 text-white font-bold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2 transition-opacity"
            >
              <MessageCircle size={16} />
              Contactar por WhatsApp
            </a>
            {proveedor.telefono && (
              <a
                href={`tel:+${proveedor.telefono}`}
                className="flex items-center justify-center gap-2 border border-cl-gray-light hover:border-cl-verde hover:text-cl-verde text-cl-dark font-bold text-sm rounded-xl py-3.5 px-5 transition-all"
              >
                <Phone size={15} />
                Llamar
              </a>
            )}
            {proveedor.instagram && (
              <a
                href={`https://instagram.com/${proveedor.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-cl-dark hover:bg-cl-dark/80 text-white font-bold text-sm rounded-xl py-3.5 px-5 transition-colors"
              >
                <Instagram size={15} />
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="md:col-span-2 flex flex-col gap-5">
            {/* Gallery */}
            {proveedor.galeria.length > 0 && (
              <div className="bg-white rounded-2xl border border-cl-gray-light p-5">
                <h2 className="font-syne font-bold text-cl-dark text-base mb-4">Galería de trabajos</h2>
                <div className="grid grid-cols-3 gap-2">
                  {proveedor.galeria.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setGaleriaIdx(i)}
                      className="aspect-square rounded-xl overflow-hidden bg-cl-bg2 flex items-center justify-center hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={img}
                        alt={`Trabajo ${i + 1} de ${proveedor.nombreNegocio}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl border border-cl-gray-light p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-syne font-bold text-cl-dark text-base">Reseñas de clientes</h2>
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm text-cl-dark">{proveedor.rating.toFixed(1)}</span>
                  <span className="text-cl-gray text-xs">({proveedor.totalResenas})</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {proveedor.resenas.map((r, i) => (
                  <div key={i} className="bg-cl-bg border border-cl-gray-light rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-cl-gray-light flex items-center justify-center text-base font-bold text-cl-gray flex-shrink-0">
                        {r.autor?.[0] ?? '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-cl-dark">{r.autor}</p>
                        {r.fecha && <p className="text-cl-gray text-xs">{r.fecha}</p>}
                      </div>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star
                            key={j}
                            size={11}
                            className={j < r.rating ? 'fill-amber-400 text-amber-400' : 'fill-cl-gray-light text-cl-gray-light'}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-cl-gray text-xs leading-relaxed">{r.comentario}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — services */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-cl-gray-light p-5">
              <h2 className="font-syne font-bold text-cl-dark text-base mb-4">Servicios y precios</h2>
              <div className="border border-cl-gray-light rounded-xl overflow-hidden">
                {proveedor.servicios.map((s, i) => (
                  <div
                    key={s.name}
                    className={`flex items-center justify-between px-4 py-3 text-sm ${
                      i < proveedor.servicios.length - 1 ? 'border-b border-cl-gray-light' : ''
                    }`}
                  >
                    <span className="text-cl-dark text-xs font-medium">{s.name}</span>
                    <span className="font-bold text-cl-verde text-xs">{s.price}</span>
                  </div>
                ))}
              </div>
              <a
                href={`https://wa.me/${proveedor.telefono}?text=Hola! Me interesa reservar un turno para ${proveedor.servicios[0]?.name ?? proveedor.cat}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleWhatsapp('servicios')}
                className="mt-4 w-full bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle size={14} />
                Reservar turno
              </a>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl border border-cl-gray-light p-5">
              <h2 className="font-syne font-bold text-cl-dark text-base mb-3">Ubicación</h2>
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-cl-verde flex-shrink-0" />
                <span className="text-cl-dark font-semibold">{proveedor.suburb}, Melbourne</span>
              </div>
              <a
               href={proveedor.lat && proveedor.lng 
  ? `https://www.google.com/maps?q=${proveedor.lat},${proveedor.lng}`
  : `https://www.google.com/maps/search/${encodeURIComponent((proveedor.direccion ?? proveedor.suburb) + ' Melbourne')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block text-center text-xs font-bold text-cl-verde hover:text-cl-verde2 border border-cl-verde/30 hover:border-cl-verde rounded-xl py-2 transition-all"
              >
                Ver en Google Maps
              </a>
            </div>
          </div>
        </div>

        {/* Related */}
        {relacionados.length > 0 && (
          <div className="mt-8">
            <h2 className="font-syne font-bold text-cl-dark text-lg mb-4">Otros proveedores de {proveedor.cat[0]}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relacionados.map((r, i) => (
                <ProviderCard key={r.id} proveedor={r} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {galeriaIdx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setGaleriaIdx(null)}
        >
          <img
            src={proveedor.galeria[galeriaIdx]}
            alt={`Trabajo ${galeriaIdx + 1}`}
            className="max-w-full max-h-full rounded-2xl object-contain"
          />
          <button
            className="absolute top-4 right-4 bg-white/10 text-white w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            onClick={() => setGaleriaIdx(null)}
          >
            ×
          </button>
        </div>
      )}

      <Footer />
      <ChatWidget />
    </div>
  )
}
