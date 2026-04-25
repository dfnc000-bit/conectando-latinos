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
    const BASE = { nombreNegocio: '', instagram: '', horario: '', fotoPerfil: '', destacado: false, estado: 'aprobado' as const, email: '', galeria: [], resenas: [], fechaRegistro: '' }
    const DEMO: Proveedor[] = [
      { ...BASE, id: 'd1', nombre: 'Studio Valeria',    cat: 'Peluquería', suburb: 'Richmond',    direccion: '123 Swan St, Richmond',      telefono: '61412345678', descripcion: 'Cortes y color para toda la familia en español.',      disponible: true, rating: 4.9, totalResenas: 34, lat: -37.8230, lng: 144.9980, servicios: [{ name: 'Corte', price: '$45' }, { name: 'Color', price: '$120' }] },
      { ...BASE, id: 'd2', nombre: 'Barberia El Patron', cat: 'Barbería',  suburb: 'Footscray',   direccion: '88 Barkly St, Footscray',     telefono: '61423456789', descripcion: 'Cortes modernos y clasicos para caballeros.',           disponible: true, rating: 4.8, totalResenas: 21, lat: -37.8010, lng: 144.8990, servicios: [{ name: 'Corte', price: '$35' }] },
      { ...BASE, id: 'd3', nombre: 'Unas by Carmen',    cat: 'Uñas',      suburb: 'Fitzroy',     direccion: '45 Smith St, Fitzroy',        telefono: '61434567890', descripcion: 'Manicura y pedicura profesional.',                      disponible: true, rating: 5.0, totalResenas: 18, lat: -37.7990, lng: 144.9780, servicios: [{ name: 'Manicura', price: '$55' }] },
      { ...BASE, id: 'd4', nombre: 'Masajes Zen Latino', cat: 'Masajes',  suburb: 'St Kilda',    direccion: '12 Acland St, St Kilda',      telefono: '61445678901', descripcion: 'Masajes relajantes y terapeuticos.',                    disponible: true, rating: 4.7, totalResenas: 29, lat: -37.8670, lng: 144.9800, servicios: [{ name: 'Relajante', price: '$80' }] },
      { ...BASE, id: 'd5', nombre: 'Maquillaje Latina', cat: 'Maquillaje', suburb: 'Carlton',    direccion: '77 Lygon St, Carlton',        telefono: '61456789012', descripcion: 'Maquillaje para eventos y novias.',                      disponible: true, rating: 4.9, totalResenas: 15, lat: -37.7970, lng: 144.9670, servicios: [{ name: 'Maquillaje evento', price: '$150' }] },
      { ...BASE, id: 'd6', nombre: 'Faciales Glow',     cat: 'Faciales',  suburb: 'South Yarra', direccion: '33 Toorak Rd, South Yarra',   telefono: '61467890123', descripcion: 'Tratamientos faciales con productos naturales.',         disponible: true, rating: 4.8, totalResenas: 22, lat: -37.8400, lng: 144.9920, servicios: [{ name: 'Facial basico', price: '$90' }] },
      { ...BASE, id: 'd7', nombre: 'Depilacion Pro',    cat: 'Depilación', suburb: 'Northcote',  direccion: '55 High St, Northcote',       telefono: '61478901234', descripcion: 'Depilacion laser y cera profesional.',                   disponible: true, rating: 4.6, totalResenas: 31, lat: -37.7710, lng: 145.0010, servicios: [{ name: 'Cera piernas', price: '$60' }] },
      { ...BASE, id: 'd8', nombre: 'Pestanas by Sofia', cat: 'Pestañas',  suburb: 'Prahran',     direccion: '21 Chapel St, Prahran',       telefono: '61489012345', descripcion: 'Extension de pestanas clasicas y volumen.',              disponible: true, rating: 5.0, totalResenas: 27, lat: -37.8520, lng: 144.9900, servicios: [{ name: 'Extension clasica', price: '$120' }] },
    ]
    getProveedoresAction().then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map((p: any) => ({
          ...p,
          totalResenas: p.total_resenas ?? 0,
          servicios: (p.servicios ?? []).map((s: any) => ({ name: s.nombre ?? s.name, price: s.precio ?? s.price })),
          galeria: p.galeria ?? [],
          resenas: [],
          fechaRegistro: p.fecha_registro ?? '',
          lat: p.lat ? Number(p.lat) : undefined,
          lng: p.lng ? Number(p.lng) : undefined,
        }))
        const conCoordenadas = mapped.filter((p: Proveedor) => p.lat && p.lng)
        setProveedores(conCoordenadas.length > 0 ? mapped : [...mapped, ...DEMO])
        setFiltrados(conCoordenadas.length > 0 ? mapped : [...mapped, ...DEMO])
      } else {
        setProveedores(DEMO)
        setFiltrados(DEMO)
      }
      setLoading(false)
    }).catch(() => {
      setProveedores(DEMO)
      setFiltrados(DEMO)
      setLoading(false)
    })
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
