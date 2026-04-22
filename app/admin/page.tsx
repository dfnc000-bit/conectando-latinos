'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Store, CheckCircle, Clock, XCircle, Star,
  Trash2, Eye, ShieldCheck, ArrowLeft, Search,
  ToggleLeft, ToggleRight, TrendingUp, MapPin
} from 'lucide-react'
import { getSesion } from '@/lib/store'
import { type Proveedor, type Usuario, CATEGORIAS } from '@/lib/types'
import {
  adminGetProveedoresAction, adminGetUsuariosAction,
  adminUpdateProveedorAction, adminDeleteProveedorAction
} from '@/lib/actions'

type Tab = 'dashboard' | 'proveedores' | 'usuarios'
type EstadoFiltro = 'todos' | 'pendiente' | 'aprobado' | 'rechazado'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    const sesion = getSesion()
    if (!sesion || sesion.tipo !== 'admin') {
      router.push('/login')
      return
    }
    cargarDatos()
  }, [router])

  async function cargarDatos() {
    const [provs, usrs] = await Promise.all([
      adminGetProveedoresAction(),
      adminGetUsuariosAction(),
    ])
    setProveedores(provs.map((p: any) => ({
      ...p,
      nombreNegocio: p.nombre,
      totalResenas: p.total_resenas ?? 0,
      fotoPerfil: p.avatar_url ?? '',
      servicios: [],
      galeria: p.galeria ?? [],
      resenas: [],
      fechaRegistro: p.fecha_registro ?? '',
    })))
    setUsuarios(usrs.map((u: any) => ({
      id: u.id, nombre: u.nombre, email: u.email ?? '',
      tipo: u.tipo, suburb: u.suburb ?? '', fechaRegistro: u.fecha_registro ?? '',
    })))
  }

  async function aprobar(id: string) {
    await adminUpdateProveedorAction(id, { estado: 'aprobado' })
    setProveedores((prev) => prev.map((x) => x.id === id ? { ...x, estado: 'aprobado' as const } : x))
  }

  async function rechazar(id: string) {
    await adminUpdateProveedorAction(id, { estado: 'rechazado' })
    setProveedores((prev) => prev.map((x) => x.id === id ? { ...x, estado: 'rechazado' as const } : x))
  }

  async function toggleDestacado(id: string) {
    const p = proveedores.find((x) => x.id === id)
    if (!p) return
    await adminUpdateProveedorAction(id, { destacado: !p.destacado })
    setProveedores((prev) => prev.map((x) => x.id === id ? { ...x, destacado: !x.destacado } : x))
  }

  async function toggleDisponible(id: string) {
    const p = proveedores.find((x) => x.id === id)
    if (!p) return
    await adminUpdateProveedorAction(id, { disponible: !p.disponible })
    setProveedores((prev) => prev.map((x) => x.id === id ? { ...x, disponible: !x.disponible } : x))
  }

  async function eliminar(id: string) {
    await adminDeleteProveedorAction(id)
    setProveedores((prev) => prev.filter((x) => x.id !== id))
    setConfirmDelete(null)
  }

  const provFiltrados = proveedores.filter((p) => {
    const matchEstado = estadoFiltro === 'todos' || p.estado === estadoFiltro
    const matchBusq = !busqueda || [p.nombreNegocio ?? p.nombre, p.nombre, p.cat, p.suburb]
      .join(' ').toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusq
  })

  const stats = {
    total: proveedores.length,
    aprobados: proveedores.filter((p) => p.estado === 'aprobado').length,
    pendientes: proveedores.filter((p) => p.estado === 'pendiente').length,
    rechazados: proveedores.filter((p) => p.estado === 'rechazado').length,
    destacados: proveedores.filter((p) => p.destacado).length,
    usuarios: usuarios.length,
  }

  // Category breakdown
  const porCategoria = CATEGORIAS
    .filter((c) => c.value !== 'todas')
    .map((c) => ({
      ...c,
      count: proveedores.filter((p) => p.cat === c.value && p.estado === 'aprobado').length,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)

  return (
    <div className="min-h-screen bg-cl-bg flex flex-col">
      {/* Admin nav */}
      <nav className="bg-cl-dark sticky top-0 z-50 h-14 flex items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al sitio
          </Link>
          <span className="text-white/20 text-sm">|</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-cl-verde2" />
            <span className="font-syne text-white font-bold text-sm tracking-tight">
              Panel de administrador
            </span>
          </div>
        </div>
        <span className="text-white/40 text-xs hidden md:block">
          Conectando <span className="text-cl-verde2">Latinos</span> Melbourne
        </span>
      </nav>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-52 bg-white border-r border-cl-gray-light py-5 px-3 gap-1 sticky top-14 h-[calc(100vh-3.5rem)]">
          {([
            { key: 'dashboard', label: 'Resumen', Icon: TrendingUp },
            { key: 'proveedores', label: 'Proveedores', Icon: Store },
            { key: 'usuarios', label: 'Usuarios', Icon: Users },
          ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left ${
                tab === key
                  ? 'bg-cl-dark text-cl-verde2'
                  : 'text-cl-gray hover:text-cl-dark hover:bg-cl-bg'
              }`}
            >
              <Icon size={15} />
              {label}
              {key === 'proveedores' && stats.pendientes > 0 && (
                <span className="ml-auto bg-amber-400 text-white text-[0.6rem] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {stats.pendientes}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden w-full fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cl-gray-light flex">
          {([
            { key: 'dashboard', label: 'Resumen', Icon: TrendingUp },
            { key: 'proveedores', label: 'Proveedores', Icon: Store },
            { key: 'usuarios', label: 'Usuarios', Icon: Users },
          ] as { key: Tab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[0.65rem] font-bold transition-colors ${
                tab === key ? 'text-cl-verde' : 'text-cl-gray'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-y-auto">

          {/* ── DASHBOARD TAB ── */}
          {tab === 'dashboard' && (
            <div>
              <h1 className="font-syne font-extrabold text-cl-dark text-2xl tracking-tight mb-6">Resumen general</h1>

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
                {[
                  { label: 'Total proveedores', value: stats.total, color: 'text-cl-dark' },
                  { label: 'Aprobados', value: stats.aprobados, color: 'text-emerald-600' },
                  { label: 'Pendientes', value: stats.pendientes, color: 'text-amber-500' },
                  { label: 'Rechazados', value: stats.rechazados, color: 'text-red-500' },
                  { label: 'Destacados', value: stats.destacados, color: 'text-cl-gold' },
                  { label: 'Usuarios', value: stats.usuarios, color: 'text-cl-verde' },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-cl-gray-light rounded-2xl p-4">
                    <p className="text-cl-gray text-[0.65rem] font-bold uppercase tracking-wider mb-1">{s.label}</p>
                    <p className={`font-syne font-extrabold text-2xl ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Pending approvals */}
              {stats.pendientes > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-amber-500" />
                    <h2 className="font-syne font-bold text-cl-dark text-base">
                      Proveedores pendientes de aprobación ({stats.pendientes})
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {proveedores.filter((p) => p.estado === 'pendiente').map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-3 bg-white rounded-xl border border-amber-200 px-4 py-3 flex-wrap"
                      >
                        <div>
                          <p className="font-bold text-sm text-cl-dark">{p.nombreNegocio}</p>
                          <p className="text-cl-gray text-xs">{p.cat} · {p.suburb} · {p.fechaRegistro}</p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/proveedor/${p.id}`}
                            className="flex items-center gap-1.5 text-xs font-bold border border-cl-gray-light text-cl-gray hover:text-cl-dark hover:border-cl-dark rounded-lg px-3 py-1.5 transition-all"
                          >
                            <Eye size={12} />
                            Ver
                          </Link>
                          <button
                            onClick={() => aprobar(p.id)}
                            className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg px-3 py-1.5 transition-colors"
                          >
                            <CheckCircle size={12} />
                            Aprobar
                          </button>
                          <button
                            onClick={() => rechazar(p.id)}
                            className="flex items-center gap-1.5 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1.5 transition-colors"
                          >
                            <XCircle size={12} />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category breakdown */}
              {porCategoria.length > 0 && (
                <div className="bg-white border border-cl-gray-light rounded-2xl p-5">
                  <h2 className="font-syne font-bold text-cl-dark text-base mb-4">Proveedores aprobados por categoría</h2>
                  <div className="flex flex-col gap-2.5">
                    {porCategoria.map((c) => (
                      <div key={c.value} className="flex items-center gap-3">
                        <span className="text-lg w-7 flex-shrink-0">{c.icon}</span>
                        <span className="text-sm font-semibold text-cl-dark w-28 flex-shrink-0">{c.label}</span>
                        <div className="flex-1 h-2 bg-cl-bg rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-cl-verde rounded-full transition-all"
                            style={{ width: `${Math.min(100, (c.count / Math.max(stats.aprobados, 1)) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-cl-gray w-6 text-right">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PROVEEDORES TAB ── */}
          {tab === 'proveedores' && (
            <div>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <h1 className="font-syne font-extrabold text-cl-dark text-2xl tracking-tight">Gestión de proveedores</h1>
              </div>

              {/* Filters */}
              <div className="flex gap-2 flex-wrap mb-4 items-center">
                <div className="flex bg-white border border-cl-gray-light rounded-xl overflow-hidden flex-shrink-0">
                  {(['todos', 'pendiente', 'aprobado', 'rechazado'] as EstadoFiltro[]).map((e) => (
                    <button
                      key={e}
                      onClick={() => setEstadoFiltro(e)}
                      className={`px-3 py-2 text-xs font-bold transition-colors capitalize ${
                        estadoFiltro === e
                          ? 'bg-cl-dark text-cl-verde2'
                          : 'text-cl-gray hover:text-cl-dark'
                      }`}
                    >
                      {e === 'todos' ? 'Todos' : e.charAt(0).toUpperCase() + e.slice(1)}
                      <span className="ml-1 text-[0.6rem]">
                        ({e === 'todos' ? stats.total : proveedores.filter((p) => p.estado === e).length})
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 bg-white border border-cl-gray-light rounded-xl px-3 py-2 flex-1 min-w-[180px]">
                  <Search size={13} className="text-cl-gray flex-shrink-0" />
                  <input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, categoría, suburbio..."
                    className="flex-1 outline-none text-xs font-jakarta text-cl-dark placeholder-cl-gray/60 bg-transparent"
                  />
                </div>
              </div>

              <p className="text-cl-gray text-xs mb-4">{provFiltrados.length} proveedor{provFiltrados.length !== 1 ? 'es' : ''}</p>

              {/* Table */}
              <div className="bg-white border border-cl-gray-light rounded-2xl overflow-hidden">
                {provFiltrados.length === 0 ? (
                  <div className="text-center py-14 text-cl-gray text-sm">Sin resultados con esos filtros.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-cl-gray-light bg-cl-bg">
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider">Proveedor</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider hidden md:table-cell">Cat.</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider hidden lg:table-cell">Suburbio</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider">Estado</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider hidden md:table-cell">Destacado</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider hidden md:table-cell">Disponible</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {provFiltrados.map((p, i) => (
                          <tr
                            key={p.id}
                            className={`border-b border-cl-gray-light last:border-b-0 hover:bg-cl-bg/50 transition-colors ${
                              i % 2 === 0 ? '' : 'bg-cl-bg/30'
                            }`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold text-cl-dark text-xs">{p.nombreNegocio}</p>
                              <p className="text-cl-gray text-[0.65rem]">{p.nombre}</p>
                              <p className="text-cl-gray text-[0.65rem]">{p.email}</p>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="text-cl-gray text-xs">{p.cat}</span>
                            </td>
                            <td className="px-4 py-3 hidden lg:table-cell">
                              <div className="flex items-center gap-1 text-cl-gray text-xs">
                                <MapPin size={10} />
                                {p.suburb}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-[0.65rem] font-bold rounded-full px-2.5 py-1 ${
                                p.estado === 'aprobado'
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                  : p.estado === 'pendiente'
                                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                  : 'bg-red-50 text-red-600 border border-red-200'
                              }`}>
                                {p.estado === 'aprobado' && <CheckCircle size={9} />}
                                {p.estado === 'pendiente' && <Clock size={9} />}
                                {p.estado === 'rechazado' && <XCircle size={9} />}
                                {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <button
                                onClick={() => toggleDestacado(p.id)}
                                title={p.destacado ? 'Quitar de destacados' : 'Marcar como destacado'}
                                className={`transition-colors ${p.destacado ? 'text-amber-400 hover:text-amber-300' : 'text-cl-gray-light hover:text-amber-400'}`}
                              >
                                <Star size={16} className={p.destacado ? 'fill-amber-400' : ''} />
                              </button>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <button
                                onClick={() => toggleDisponible(p.id)}
                                title={p.disponible ? 'Marcar como no disponible' : 'Marcar como disponible'}
                              >
                                {p.disponible
                                  ? <ToggleRight size={20} className="text-cl-verde" />
                                  : <ToggleLeft size={20} className="text-cl-gray-light" />
                                }
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {p.estado === 'pendiente' && (
                                  <>
                                    <button
                                      onClick={() => aprobar(p.id)}
                                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[0.65rem] font-bold rounded-lg px-2.5 py-1.5 transition-colors"
                                    >
                                      Aprobar
                                    </button>
                                    <button
                                      onClick={() => rechazar(p.id)}
                                      className="bg-red-500 hover:bg-red-600 text-white text-[0.65rem] font-bold rounded-lg px-2.5 py-1.5 transition-colors"
                                    >
                                      Rechazar
                                    </button>
                                  </>
                                )}
                                {p.estado === 'rechazado' && (
                                  <button
                                    onClick={() => aprobar(p.id)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[0.65rem] font-bold rounded-lg px-2.5 py-1.5 transition-colors"
                                  >
                                    Aprobar
                                  </button>
                                )}
                                {p.estado === 'aprobado' && (
                                  <button
                                    onClick={() => rechazar(p.id)}
                                    className="border border-cl-gray-light hover:border-red-300 text-cl-gray hover:text-red-500 text-[0.65rem] font-bold rounded-lg px-2.5 py-1.5 transition-all"
                                  >
                                    Suspender
                                  </button>
                                )}
                                <Link
                                  href={`/proveedor/${p.id}`}
                                  className="border border-cl-gray-light text-cl-gray hover:text-cl-dark hover:border-cl-dark text-[0.65rem] font-bold rounded-lg p-1.5 transition-all flex items-center"
                                >
                                  <Eye size={12} />
                                </Link>
                                <button
                                  onClick={() => setConfirmDelete(p.id)}
                                  className="border border-cl-gray-light text-cl-gray hover:border-red-300 hover:text-red-500 text-[0.65rem] font-bold rounded-lg p-1.5 transition-all flex items-center"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── USUARIOS TAB ── */}
          {tab === 'usuarios' && (
            <div>
              <h1 className="font-syne font-extrabold text-cl-dark text-2xl tracking-tight mb-5">Usuarios registrados</h1>
              <div className="bg-white border border-cl-gray-light rounded-2xl overflow-hidden">
                {usuarios.length === 0 ? (
                  <div className="text-center py-14 text-cl-gray text-sm">Todavía no hay usuarios registrados.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-cl-gray-light bg-cl-bg">
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider">Usuario</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider">Tipo</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider hidden md:table-cell">Suburbio</th>
                          <th className="px-4 py-3 text-cl-gray text-[0.68rem] font-bold uppercase tracking-wider hidden md:table-cell">Registro</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usuarios.map((u, i) => (
                          <tr
                            key={u.id}
                            className={`border-b border-cl-gray-light last:border-b-0 hover:bg-cl-bg/50 ${i % 2 === 0 ? '' : 'bg-cl-bg/30'}`}
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold text-cl-dark text-xs">{u.nombre}</p>
                              <p className="text-cl-gray text-[0.65rem]">{u.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[0.65rem] font-bold rounded-full px-2.5 py-1 ${
                                u.tipo === 'proveedor'
                                  ? 'bg-cl-verde/10 text-cl-verde border border-cl-verde/30'
                                  : u.tipo === 'admin'
                                  ? 'bg-cl-dark text-cl-verde2 border border-cl-dark'
                                  : 'bg-cl-bg border border-cl-gray-light text-cl-gray'
                              }`}>
                                {u.tipo.charAt(0).toUpperCase() + u.tipo.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-cl-gray text-xs hidden md:table-cell">{u.suburb || '—'}</td>
                            <td className="px-4 py-3 text-cl-gray text-xs hidden md:table-cell">{u.fechaRegistro || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-syne font-bold text-cl-dark text-lg mb-2">Eliminar proveedor</h3>
            <p className="text-cl-gray text-sm mb-5">
              Esta accion es permanente y no se puede deshacer. El proveedor sera eliminado completamente del directorio.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-cl-gray-light text-cl-dark font-bold text-sm rounded-xl py-2.5 hover:bg-cl-bg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar(confirmDelete)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl py-2.5 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
