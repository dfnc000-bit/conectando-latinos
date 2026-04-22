'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { MapaProveedores } from '@/components/mapa-proveedores'
import { getProveedoresAction } from '@/lib/actions'
import { CATEGORIAS, type Proveedor } from '@/lib/types'
import { Search, Star, MapPin, MessageCircle } from 'lucide-react'
import Link from 'next/link'

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

  const conCoordenadas = filtrados.filter((p) => p.lat && p.lng)
  const sinCoordenadas = filtrados.filter((p) => !p.lat || !p.lng)

  return (
    <div className="flex flex-col h-screen bg-cl-bg">
      <Navbar />

      {/* Barra de filtros */}
      <div className="bg-white border-b border-cl-gray-light px-4 py-3 flex flex-col gap-2 z-10 flex-shrink-0">
        <div className="relative max-w-lg w-full mx-auto">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-cl-gray" />
          <input
            type="text"
            placeholder="Buscar por nombre, servicio o suburbio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cl-bg border border-cl-gray-light rounded-xl text-sm text-cl-dark placeholder:text-cl-gray focus:outline-none focus:border-cl-verde"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cl-verde border-t-transparent rounded-full animate-spin" />
            <p className="text-cl-gray text-sm font-semibold">Cargando proveedores...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Mapa */}
          <div className="flex-1 relative min-h-[50vh] md:min-h-0">
            <MapaProveedores proveedores={filtrados} />
          </div>

          {/* Lista lateral */}
          {filtrados.length > 0 && (
            <div className="md:w-80 w-full md:h-full h-64 overflow-y-auto border-t md:border-t-0 md:border-l border-cl-gray-light bg-white flex-shrink-0">
              <div className="p-3 border-b border-cl-gray-light sticky top-0 bg-white z-10">
                <p className="text-cl-dark font-bold text-sm">{filtrados.length} proveedores</p>
                <p className="text-cl-gray text-xs">{conCoordenadas.length} en el mapa</p>
              </div>
              <div className="divide-y divide-cl-gray-light">
                {filtrados.map((p) => (
                  <Link key={p.id} href={`/proveedor/${p.id}`} className="flex gap-3 p-3 hover:bg-cl-bg transition-colors group">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-cl-dark flex items-center justify-center overflow-hidden">
                      {p.fotoPerfil ? (
                        <img src={p.fotoPerfil} alt={p.nombre} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-cl-verde2 font-extrabold text-lg">{p.nombre.charAt(0)}</span>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-cl-dark font-bold text-sm truncate group-hover:text-cl-verde transition-colors">{p.nombre}</p>
                      <p className="text-cl-gray text-xs">{p.cat} · {p.suburb}</p>
                      {p.direccion && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin size={10} className="text-cl-verde flex-shrink-0" />
                          <p className="text-cl-gray text-[0.65rem] truncate">{p.direccion}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star size={10} className="text-amber-400 fill-amber-400" />
                          <span className="text-cl-dark font-bold text-xs">{p.rating?.toFixed(1)}</span>
                        </div>
                        <span className={`text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full ${p.disponible ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                          {p.disponible ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
