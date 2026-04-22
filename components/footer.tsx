import Link from 'next/link'

export function Footer() {
  const categorias = ['Peluquería', 'Barbería', 'Uñas', 'Masajes', 'Maquillaje']

  return (
    <footer className="bg-cl-dark px-6 pt-14 pb-7">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="block mb-3">
              <span className="font-syne text-white text-xl font-extrabold tracking-tight">
                Conectando <span className="text-cl-verde2">Latinos</span>
              </span>
              <span className="block font-jakarta text-[0.58rem] font-medium tracking-[2.5px] text-white/40 uppercase mt-0.5">
                Melbourne · Australia
              </span>
            </Link>
            <p className="text-white/45 text-xs leading-relaxed max-w-[260px]">
              La plataforma que conecta a la comunidad latina en Melbourne con servicios de belleza y bienestar — en español, cerca tuyo.
            </p>
          </div>

          {/* Explorar */}
          <div>
            <h4 className="text-white/80 font-bold text-sm mb-4">Explorar</h4>
            <div className="flex flex-col gap-2.5">
              {categorias.map((cat) => (
                <Link
                  key={cat}
                  href={`/servicios?cat=${encodeURIComponent(cat)}`}
                  className="text-white/40 hover:text-cl-verde2 text-xs transition-colors"
                >
                  {cat}
                </Link>
              ))}
              <Link href="/servicios" className="text-white/40 hover:text-cl-verde2 text-xs transition-colors">
                Ver todos
              </Link>
            </div>
          </div>

          {/* Para proveedores */}
          <div>
            <h4 className="text-white/80 font-bold text-sm mb-4">Para proveedores</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/registro?tab=proveedor" className="text-white/40 hover:text-cl-verde2 text-xs transition-colors">
                Registrar negocio
              </Link>
              <Link href="/login" className="text-white/40 hover:text-cl-verde2 text-xs transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/dashboard" className="text-white/40 hover:text-cl-verde2 text-xs transition-colors">
                Mi panel
              </Link>
              <a href="/#como" className="text-white/40 hover:text-cl-verde2 text-xs transition-colors">
                Cómo funciona
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.08] pt-5 text-center">
          <p className="text-white/30 text-xs">
            © 2025 Conectando Latinos Melbourne · Hecho con amor para la comunidad latina en Australia
          </p>
        </div>
      </div>
    </footer>
  )
}
