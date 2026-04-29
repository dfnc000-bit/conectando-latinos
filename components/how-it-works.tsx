'use client'

const PASOS = [
  {
    num: '01',
    title: 'Buscá tu servicio',
    desc: 'Escribí lo que necesitás y filtrá por suburbio dentro de Melbourne.',
  },
  {
    num: '02',
    title: 'Revisá perfiles',
    desc: 'Mirá fotos de trabajos, servicios, precios y reseñas reales de clientes.',
  },
  {
    num: '03',
    title: 'Contactá directo',
    desc: 'Escribile por WhatsApp y coordiná tu turno sin intermediarios.',
  },
  {
    num: '04',
    title: 'Dejá tu reseña',
    desc: 'Ayudá a otros de la comunidad compartiendo tu experiencia.',
  },
]

export function HowItWorks() {
  return (
    <section id="como" className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-cl-verde text-xs font-bold tracking-[2.5px] uppercase mb-2">Simple y rápido</p>
        <h2
          className="font-syne text-cl-dark font-extrabold tracking-tight mb-3 text-balance"
          style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2rem)' }}
        >
          ¿Cómo funciona?
        </h2>
        <p className="text-cl-dark/60 text-sm leading-relaxed max-w-md mx-auto mb-12">
          En cuatro pasos encontrás el servicio que necesitás, sin complicaciones y en español.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PASOS.map((p, i) => (
            <div
              key={p.num}
              className="bg-cl-dark border border-white/[0.08] rounded-2xl p-6 text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-xl bg-white/[0.08] flex items-center justify-center mb-4 group-hover:bg-cl-verde transition-colors duration-200">
                <span className="font-syne text-cl-verde2 font-extrabold text-sm group-hover:text-white transition-colors duration-200">
                  {p.num}
                </span>
              </div>
              <h3 className="font-syne font-bold text-white text-sm mb-2">{p.title}</h3>
              <p className="text-white/55 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
