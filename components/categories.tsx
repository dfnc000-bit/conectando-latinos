'use client'
import Link from 'next/link'
import { CATEGORIAS } from '@/lib/types'

interface CategoriesProps {
  active?: string
  onChange?: (value: string) => void
  linkMode?: boolean
}

export function Categories({ active, onChange, linkMode = false }: CategoriesProps) {
  return (
    <section className="bg-cl-bg2 py-16 px-6" id="categorias">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-cl-verde text-xs font-bold tracking-[2.5px] uppercase mb-2">Explorá por tipo</p>
        <h2
          className="font-syne text-white font-extrabold tracking-tight mb-3 text-balance"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)' }}
        >
          Categorías de servicios
        </h2>
        <p className="text-white/55 text-sm leading-relaxed max-w-md mx-auto mb-8">
          Desde peluquería y cejas hasta autos, comida, tecnología y mucho más — todo en un solo lugar.
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2.5">
          {CATEGORIAS.map((cat) => {
            const isActive = active === cat.value
            const baseClass = `col-span-1 flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3.5 border transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-cl-dark border-cl-verde2 text-cl-verde2 shadow-lg -translate-y-1'
                : 'bg-white/[0.06] border-white/[0.12] text-white/70 hover:bg-cl-dark hover:border-cl-verde2 hover:text-cl-verde2 hover:-translate-y-1 hover:shadow-lg'
            }`
            if (linkMode) {
              const href = cat.value === 'todas' ? '/servicios' : `/servicios?cat=${encodeURIComponent(cat.value)}`
              return (
                <Link key={cat.value} href={href} className={baseClass}>
                  <span className="text-xl leading-none">{cat.icon}</span>
                  <span className="text-[0.65rem] font-bold leading-tight">{cat.label}</span>
                </Link>
              )
            }
            return (
              <button
                key={cat.value}
                onClick={() => onChange?.(cat.value)}
                className={baseClass}
              >
                <span className="text-xl leading-none">{cat.icon}</span>
                <span className="text-[0.65rem] font-bold leading-tight">{cat.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
