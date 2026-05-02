'use client'

import Link from 'next/link'
import { MapPin, Star, MessageCircle, ExternalLink } from 'lucide-react'
import { type Proveedor, gradForCat, iconForCat } from '@/lib/types'

interface ProviderCardProps {
  proveedor: Proveedor
  index?: number
}

export function ProviderCard({ proveedor: p, index = 0 }: ProviderCardProps) {
  const grad = gradForCat(p.cat[0])
  const icon = iconForCat(p.cat[0])
  const previewTags = p.servicios.slice(0, 3)
  const extra = p.servicios.length - 3

  return (
    <article
      className="bg-white border border-cl-gray-light rounded-[1.125rem] overflow-hidden hover:-translate-y-1.5 hover:shadow-2xl hover:border-cl-verde transition-all duration-200 flex flex-col"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Cover */}
      <div className="h-28 relative flex-shrink-0" style={{ background: grad }}>
        {p.fotoPerfil ? (
          <img
            src={p.fotoPerfil}
            alt={`Foto de portada de ${p.nombreNegocio}`}
            className="w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-sm text-white/90 text-[0.68rem] font-bold rounded-md px-2.5 py-1">
          {p.cat}
        </div>
        <div
          className={`absolute top-2.5 right-2.5 text-[0.68rem] font-bold rounded-md px-2.5 py-1 backdrop-blur-sm ${
            p.disponible ? 'bg-black/60 text-emerald-400' : 'bg-black/60 text-red-400'
          }`}
        >
          {p.disponible ? '● Disponible' : '● No disponible'}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pt-0 pb-0 flex-1">
        <div className="flex items-end -mt-8 mb-3 gap-2.5">
          <div className="w-16 h-16 rounded-[0.875rem] border-[3px] border-white bg-cl-bg2 flex items-center justify-center text-2xl shadow-md flex-shrink-0 overflow-hidden">
            {p.fotoPerfil ? (
              <img src={p.fotoPerfil} alt={p.nombre} className="w-full h-full object-cover" />
            ) : (
              <span>{icon}</span>
            )}
          </div>
          <div className="ml-auto mb-1">
            <span className="bg-cl-verde/10 border border-cl-verde text-cl-verde text-[0.65rem] font-bold rounded-md px-2.5 py-1">
              Verificado/a
            </span>
          </div>
        </div>

        <h3 className="font-syne font-bold text-cl-dark text-[0.95rem] mb-0.5 leading-tight">{p.nombreNegocio}</h3>
        <p className="text-cl-verde text-xs font-bold mb-1">{p.cat}</p>
        <div className="flex items-center gap-1 text-cl-gray text-xs mb-2">
          <MapPin size={11} />
          <span>{p.suburb}, Melbourne</span>
        </div>
        <p className="text-cl-gray text-xs leading-relaxed mb-2.5 line-clamp-2">{p.descripcion}</p>

        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < Math.round(p.rating) ? 'fill-amber-400 text-amber-400' : 'text-cl-gray-light fill-cl-gray-light'}
              />
            ))}
          </div>
          <span className="font-bold text-xs text-cl-dark">{p.rating.toFixed(1)}</span>
          <span className="text-cl-gray text-xs">({p.totalResenas} reseñas)</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3.5">
          {previewTags.map((s) => (
            <span
              key={s.name}
              className="bg-cl-bg border border-cl-gray-light text-cl-gray text-[0.65rem] font-semibold rounded-md px-2.5 py-1"
            >
              {s.name}
            </span>
          ))}
          {extra > 0 && (
            <span className="bg-cl-bg border border-cl-gray-light text-cl-gray text-[0.65rem] font-semibold rounded-md px-2.5 py-1">
              +{extra} más
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-2 px-4 py-3 border-t border-cl-gray-light mt-auto">
        <a
          href={`https://wa.me/${p.telefono}?text=Hola! Te vi en Conectando Latinos Melbourne y me interesa tu servicio de ${p.cat}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25d366] hover:opacity-85 text-white text-xs font-bold rounded-lg py-2.5 flex items-center justify-center gap-1.5 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <MessageCircle size={13} />
          WhatsApp
        </a>
        <Link
          href={`/proveedor/${p.id}`}
          className="flex-1 bg-transparent text-cl-dark border border-cl-gray-light hover:border-cl-verde hover:text-cl-verde text-xs font-bold rounded-lg py-2.5 flex items-center justify-center gap-1.5 transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink size={12} />
          Ver perfil
        </Link>
      </div>
    </article>
  )
}
