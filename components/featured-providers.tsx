'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { type Proveedor } from '@/lib/types'
import { getProveedoresAction } from '@/lib/actions'
import { ProviderCard } from './provider-card'

export function FeaturedProviders() {
  const [destacados, setDestacados] = useState<Proveedor[]>([])

  useEffect(() => {
    getProveedoresAction({ soloDisponibles: false }).then((data) => {
      const mapped = data
        .filter((p: any) => p.destacado)
        .slice(0, 4)
        .map((p: any) => ({
          ...p,
          nombreNegocio: p.nombre,
          totalResenas: p.total_resenas ?? 0,
          fotoPerfil: p.avatar_url ?? '',
          servicios: (p.servicios ?? []).map((s: any) => ({ name: s.nombre, price: s.precio })),
          galeria: p.galeria ?? [],
          resenas: [],
          fechaRegistro: p.fecha_registro ?? '',
        }))
      setDestacados(mapped)
    })
  }, [])

  if (destacados.length === 0) return null

  return (
    <section className="py-14 px-6 bg-white" id="destacados">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
          <div>
            <p className="text-cl-verde text-xs font-bold tracking-[2.5px] uppercase mb-1">Seleccionados para vos</p>
            <h2
              className="font-syne text-cl-dark font-extrabold tracking-tight text-balance"
              style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)' }}
            >
              Proveedores destacados
            </h2>
          </div>
          <Link
            href="/servicios"
            className="flex items-center gap-1.5 text-cl-verde font-bold text-sm hover:text-cl-verde2 transition-colors"
          >
            Ver todos
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {destacados.map((p, i) => (
            <ProviderCard key={p.id} proveedor={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
