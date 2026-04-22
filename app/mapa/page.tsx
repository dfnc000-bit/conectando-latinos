'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import MapaProveedores from '@/components/mapa-proveedores'
import { getProveedoresAction } from '@/lib/actions'
import { CATEGORIAS, type Proveedor } from '@/lib/types'
import { Search } from 'lucide-react'

export default function MapaPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [filtrados, setFiltrados] = useState<Proveedor[]>([])
  const [catFiltro, setCatFiltro] = useState('todas')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProveedoresAction().then((data) => {
      const mapped = data.map((p: any) => ({
        ...p,
        nombreNegocio: p.nombre,
        totalResenas: p.total_resenas ?? 0,
        fotoPerfil: p.avatar_url ?? '',
        servicios: (p.servicios ?? []).map((s: any) => ({ name: s.nombre ?? s.name, price: s.precio ?? s.price })),
        galeria: p.galeria ?? [],
        resenas: [],
        fechaRegistro: p.fecha_registro ?? '',
        lat: p.lat ? Number(p.lat) : undefined,
        lng: p.lng ? Number(p.lng) : undefined,
      }))
      setProveedores(mapped)
      setFiltrados(mapped)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    let resultado = proveedores
    if (catFiltro !== 'todas') resultado = resultado.filter((p) => p.cat === catFiltro)
    if (busqueda) {
      const q = busqueda.toLowerCase()
      resultado = resultado.filter((p) =>
        `${p.nombre} ${p.cat} ${p.suburb} ${p.descripcion ?? ''}`.toLowerCase().includes(q)
      )
    }
    setFiltrados(resultado)
  }, [catFiltro, busqueda, proveedores])

  return (
    <div className="flex flex-col h-screen bg-cl-bg overflow-hidden">
      <Navbar />

      {/* Barra de busqueda y filtros */}
      <div className="bg-white border-b border-cl-gray-light px-4 py-3 flex flex-col gap-2 flex-shrink-0">
        <div className="relative max-w-lg w-full mx-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cl-gray" />
          <input
            type="text"
            placeholder="Buscar emprendedor, servicio o suburbio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cl-bg border border-cl-gray-light rounded-xl text-sm text-cl-dark placeholder:text-cl-gray focus:outline-none focus:border-cl-verde"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
          {CATEGORIAS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCatFiltro(c.value)}
              className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                catFiltro === c.value
                  ? 'bg-cl-dark text-cl-verde2 border-cl-dark'
                  : 'bg-white text-cl-gray border-cl-gray-light hover:border-cl-dark hover:text-cl-dark'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa ocupa todo el espacio restante */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cl-verde border-t-transparent rounded-full animate-spin" />
            <p className="text-cl-gray text-sm font-semibold">Cargando mapa...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 relative overflow-hidden">
          <MapaProveedores proveedores={filtrados} />
        </div>
      )}
    </div>
  )
}
