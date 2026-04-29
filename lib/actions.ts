'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Proveedor, Usuario } from '@/lib/types'

// Datos semilla locales — se usan cuando Supabase no esta disponible en preview
const SEED_PROVEEDORES = [
  {
    id: 'p1', nombre: 'Ana Castillo', email: 'ana@ejemplo.com', telefono: '61412345678',
    instagram: 'anacastillo', cat: 'Peluquería', suburb: 'Footscray',
    direccion: '85 Barkly St, Footscray VIC 3011',
    lat: -37.8001, lng: 144.8997,
    descripcion: 'Especialista en cortes y coloración para todo tipo de cabello. Más de 8 años de experiencia en Melbourne.',
    horario: 'Lun–Sáb 9am–7pm', estado: 'aprobado', disponible: true, destacado: true,
    rating: 4.9, total_resenas: 47, avatar_url: '', galeria: [],
    fecha_registro: '2024-01-15',
    servicios: [{ nombre: 'Corte y peinado', precio: '$65' }, { nombre: 'Coloración completa', precio: '$120' }, { nombre: 'Tratamiento keratina', precio: '$180' }],
  },
  {
    id: 'p2', nombre: 'Carlos Medina', email: 'carlos@ejemplo.com', telefono: '61423456789',
    instagram: 'carlosbarberia', cat: 'Barbería', suburb: 'Sunshine',
    direccion: '12 Hampshire Rd, Sunshine VIC 3020',
    lat: -37.7891, lng: 144.8302,
    descripcion: 'Barbero profesional especializado en cortes modernos, degradados y diseños de barba.',
    horario: 'Mar–Dom 10am–8pm', estado: 'aprobado', disponible: true, destacado: true,
    rating: 4.8, total_resenas: 62, avatar_url: '', galeria: [],
    fecha_registro: '2024-02-10',
    servicios: [{ nombre: 'Corte clásico', precio: '$35' }, { nombre: 'Corte + barba', precio: '$55' }, { nombre: 'Diseño de barba', precio: '$25' }],
  },
  {
    id: 'p3', nombre: 'María Fernández', email: 'maria@ejemplo.com', telefono: '61434567890',
    instagram: 'mariaunas', cat: 'Uñas', suburb: 'Dandenong',
    direccion: '45 Walker St, Dandenong VIC 3175',
    lat: -37.9875, lng: 145.2151,
    descripcion: 'Nail artist certificada. Especialista en gel, acrílico, nail art y diseños personalizados.',
    horario: 'Lun–Sáb 10am–6pm', estado: 'aprobado', disponible: true, destacado: true,
    rating: 5.0, total_resenas: 38, avatar_url: '', galeria: [],
    fecha_registro: '2024-03-05',
    servicios: [{ nombre: 'Gel completo', precio: '$70' }, { nombre: 'Acrílico', precio: '$85' }, { nombre: 'Nail art', precio: '$95' }],
  },
  {
    id: 'p4', nombre: 'Sofía López', email: 'sofia@ejemplo.com', telefono: '61445678901',
    instagram: 'sofiamasajes', cat: 'Masajes', suburb: 'Melbourne CBD',
    direccion: '200 Bourke St, Melbourne VIC 3000',
    lat: -37.8136, lng: 144.9631,
    descripcion: 'Terapeuta certificada en masajes relajantes, deportivos y descontracturantes.',
    horario: 'Lun–Vie 9am–7pm', estado: 'aprobado', disponible: true, destacado: false,
    rating: 4.7, total_resenas: 29, avatar_url: '', galeria: [],
    fecha_registro: '2024-03-20',
    servicios: [{ nombre: 'Masaje relajante 60min', precio: '$90' }, { nombre: 'Masaje deportivo 90min', precio: '$130' }],
  },
  {
    id: 'p5', nombre: 'Valentina Ruiz', email: 'valentina@ejemplo.com', telefono: '61456789012',
    instagram: 'valmakeup', cat: 'Maquillaje', suburb: 'St Albans',
    direccion: '33 Main Rd E, St Albans VIC 3021',
    lat: -37.7468, lng: 144.8054,
    descripcion: 'Maquilladora profesional para novias, eventos, quinceañeras y sesiones de fotos.',
    horario: 'Mié–Dom 10am–8pm', estado: 'aprobado', disponible: true, destacado: false,
    rating: 4.9, total_resenas: 54, avatar_url: '', galeria: [],
    fecha_registro: '2024-04-01',
    servicios: [{ nombre: 'Maquillaje social', precio: '$80' }, { nombre: 'Maquillaje novia', precio: '$180' }, { nombre: 'Prueba de maquillaje', precio: '$60' }],
  },
  {
    id: 'p6', nombre: 'Diego Torres', email: 'diego@ejemplo.com', telefono: '61467890123',
    instagram: 'diegofaciales', cat: 'Faciales', suburb: 'Werribee',
    direccion: '15 Comben Dr, Werribee VIC 3030',
    lat: -37.9026, lng: 144.6630,
    descripcion: 'Esteticista certificado especializado en tratamientos faciales, limpieza profunda e hidratación.',
    horario: 'Mar–Sáb 10am–6pm', estado: 'aprobado', disponible: true, destacado: false,
    rating: 4.6, total_resenas: 21, avatar_url: '', galeria: [],
    fecha_registro: '2024-04-15',
    servicios: [{ nombre: 'Limpieza facial', precio: '$75' }, { nombre: 'Hidratación profunda', precio: '$95' }, { nombre: 'Peeling', precio: '$110' }],
  },
]

// ── TRACKING WHATSAPP ────────────────────────────────────────────────────────

export async function registrarClickWhatsappAction(proveedorId: string, fuente: string = 'perfil') {
  try {
    const supabase = await createClient()
    await supabase.from('clicks_whatsapp').insert({
      proveedor_id: proveedorId,
      fuente,
      fecha: new Date().toISOString(),
    })
  } catch {
    // Silencioso — el tracking no debe interrumpir la navegacion
  }
}

export async function getClicksWhatsappAction(proveedorId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('clicks_whatsapp')
      .select('fecha, fuente')
      .eq('proveedor_id', proveedorId)
      .order('fecha', { ascending: false })
    return data ?? []
  } catch {
    return []
  }
}

export async function getResumenClicksAction(proveedorId: string) {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('clicks_whatsapp')
      .select('fecha')
      .eq('proveedor_id', proveedorId)
    if (!data) return { total: 0, esteMes: 0, semanaActual: 0 }

    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - 7)

    return {
      total: data.length,
      esteMes: data.filter((c: any) => new Date(c.fecha) >= inicioMes).length,
      semanaActual: data.filter((c: any) => new Date(c.fecha) >= inicioSemana).length,
    }
  } catch {
    return { total: 0, esteMes: 0, semanaActual: 0 }
  }
}

// ── AUTH ────────────────────────────────────────────────────────────────────

export async function loginAction(email: string, password: string) {
  // Admin hardcodeado
  if (email === 'admin@conectandolatinos.com' && password === 'admin123') {
    return { tipo: 'admin' as const, error: null }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { tipo: null, error: error.message }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('tipo')
    .eq('id', data.user.id)
    .single()

  const { data: prov } = await supabase
    .from('proveedores')
    .select('id')
    .eq('user_id', data.user.id)
    .single()

  return {
    tipo: (perfil?.tipo ?? 'cliente') as 'cliente' | 'proveedor' | 'admin',
    proveedorId: prov?.id ?? null,
    error: null,
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}

export async function registrarClienteAction(data: {
  nombre: string
  email: string
  password: string
  suburb: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: {
        nombre: data.nombre,
        tipo: 'cliente',
        suburb: data.suburb,
      },
    },
  })
  if (error) return { error: error.message }
  return { error: null }
}

export async function registrarProveedorAction(formData: {
  nombre: string
  nombreNegocio: string
  email: string
  password: string
  telefono: string
  instagram: string
  cat: string
  suburb: string
  descripcion: string
  horario: string
  direccion: string
  fotoPerfil: string
  galeria: string[]
  servicios: { name: string; price: string }[]
}) {
  const supabase = await createClient()

  // 1. Crear usuario en Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
      data: {
        nombre: formData.nombre,
        tipo: 'proveedor',
        suburb: formData.suburb,
      },
    },
  })

  if (authError) return { error: authError.message, proveedorId: null }
  if (!authData.user) return { error: 'No se pudo crear el usuario.', proveedorId: null }

  // 2. Crear proveedor en la tabla
  const provId = `p_${Date.now()}`
  const { error: provError } = await supabase.from('proveedores').insert({
    id: provId,
    user_id: authData.user.id,
    nombre: formData.nombre,
    email: formData.email,
    telefono: formData.telefono.replace(/\D/g, ''),
    instagram: formData.instagram.replace('@', ''),
    cat: formData.cat,
    suburb: formData.suburb,
    descripcion: formData.descripcion,
    horario: formData.horario || 'Lun–Vie 9am–6pm',
    direccion: formData.direccion || null,
    estado: 'pendiente',
    disponible: true,
    destacado: false,
    avatar_url: formData.fotoPerfil,
    galeria: formData.galeria,
  })

  if (provError) return { error: provError.message, proveedorId: null }

  // 3. Insertar servicios
  if (formData.servicios.length > 0) {
    const servRows = formData.servicios
      .filter((s) => s.name.trim())
      .map((s) => ({ proveedor_id: provId, nombre: s.name, precio: s.price }))
    if (servRows.length > 0) {
      await supabase.from('servicios').insert(servRows)
    }
  }

  revalidatePath('/servicios')
  return { error: null, proveedorId: provId, userId: authData.user.id }
}

// ── PROVEEDORES ─────────────────────────────────────────────────────────────

export async function getProveedoresAction(filtros?: {
  cat?: string
  suburb?: string
  busqueda?: string
  soloDisponibles?: boolean
}) {
  const supabase = await createClient()

  let query = supabase
    .from('proveedores')
    .select('*, servicios(*)')
    .eq('estado', 'aprobado')

  if (filtros?.cat && filtros.cat !== 'todas') query = query.eq('cat', filtros.cat)
  if (filtros?.suburb) query = query.eq('suburb', filtros.suburb)
  if (filtros?.soloDisponibles) query = query.eq('disponible', true)
  if (filtros?.busqueda) {
    query = query.or(
      `nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%,cat.ilike.%${filtros.busqueda}%`
    )
  }

  const { data, error } = await query.order('destacado', { ascending: false }).order('rating', { ascending: false })
  if (error || !data || data.length === 0) {
    // Fallback a datos locales cuando Supabase no esta disponible
    let resultado = SEED_PROVEEDORES as any[]
    if (filtros?.cat && filtros.cat !== 'todas') resultado = resultado.filter((p) => p.cat === filtros!.cat)
    if (filtros?.suburb) resultado = resultado.filter((p) => p.suburb === filtros!.suburb)
    if (filtros?.busqueda) {
      const q = filtros.busqueda.toLowerCase()
      resultado = resultado.filter((p) => `${p.nombre} ${p.cat} ${p.descripcion}`.toLowerCase().includes(q))
    }
    return resultado
  }
  return data ?? []
}

export async function getProveedorByIdAction(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('proveedores')
    .select('*, servicios(*), resenas(*)')
    .eq('id', id)
    .single()
  if (!data) {
    return SEED_PROVEEDORES.find((p) => p.id === id) ?? null
  }
  return data
}

export async function getProveedorByUserAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('proveedores')
    .select('*, servicios(*)')
    .eq('user_id', user.id)
    .single()
  return data
}

export async function updateProveedorAction(id: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { error } = await supabase.from('proveedores').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/proveedor/${id}`)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function updateServiciosAction(proveedorId: string, servicios: { name: string; price: string }[]) {
  const supabase = await createClient()
  await supabase.from('servicios').delete().eq('proveedor_id', proveedorId)
  const rows = servicios.filter((s) => s.name.trim()).map((s) => ({
    proveedor_id: proveedorId,
    nombre: s.name,
    precio: s.price,
  }))
  if (rows.length > 0) await supabase.from('servicios').insert(rows)
  revalidatePath('/dashboard')
  return { error: null }
}

export async function agregarResenaAction(data: {
  proveedorId: string
  rating: number
  comentario: string
  nombreUsuario: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error } = await supabase.from('resenas').insert({
    proveedor_id: data.proveedorId,
    user_id: user?.id ?? null,
    nombre_usuario: data.nombreUsuario,
    rating: data.rating,
    comentario: data.comentario,
  })
  if (error) return { error: error.message }

  // Actualizar rating promedio
  const { data: resenas } = await supabase
    .from('resenas')
    .select('rating')
    .eq('proveedor_id', data.proveedorId)

  if (resenas && resenas.length > 0) {
    const avg = resenas.reduce((a: any, r: any) => a + r.rating, 0) / resenas.length
    await supabase.from('proveedores').update({
      rating: Math.round(avg * 10) / 10,
      total_resenas: resenas.length,
    }).eq('id', data.proveedorId)
  }

  revalidatePath(`/proveedor/${data.proveedorId}`)
  return { error: null }
}

// ── ADMIN ────────────────────────────────────────────────────────────────────

export async function adminGetProveedoresAction() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('proveedores')
    .select('*')
    .order('fecha_registro', { ascending: false })
  return data ?? []
}

export async function adminUpdateProveedorAction(id: string, updates: Record<string, any>) {
  const supabase = await createClient()
  const { error } = await supabase.from('proveedores').update(updates).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/servicios')
  return { error: null }
}

export async function adminDeleteProveedorAction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('proveedores').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin')
  revalidatePath('/servicios')
  return { error: null }
}

export async function adminGetUsuariosAction() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('perfiles')
    .select('*')
    .order('fecha_registro', { ascending: false })
  return data ?? []
}
