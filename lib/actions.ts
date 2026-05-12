'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Proveedor, Usuario } from '@/lib/types'

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
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD && ADMIN_EMAIL !== '') {
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

// ── REGISTRO CLIENTE ─────────────────────────────────────────────────────────

export async function registrarClienteAction(data: {
  nombre: string
  email: string
  password: string
  suburb: string
  aceptaPublicidad: boolean
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
        acepta_publicidad: data.aceptaPublicidad,
      },
    },
  })
  if (error) return { error: error.message }
  return { error: null }
}

// ── REGISTRO PROVEEDOR ───────────────────────────────────────────────────────

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
  aceptaPublicidad: boolean
}) {
  const supabase = await createClient()

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
        acepta_publicidad: formData.aceptaPublicidad,
      },
    },
  })

  if (authError) return { error: authError.message, proveedorId: null }
  if (!authData.user) return { error: 'No se pudo crear el usuario.', proveedorId: null }

  const provId = `p_${Date.now()}`
  const { error: provError } = await supabase.from('proveedores').insert({
    id: provId,
    user_id: authData.user.id,
    nombre: formData.nombre,
    email: formData.email,
    telefono: formData.telefono.replace(/\D/g, ''),
    instagram: formData.instagram.replace('@', ''),
    cat: Array.isArray(formData.cat) ? formData.cat : [formData.cat],
    suburb: formData.suburb,
    descripcion: formData.descripcion,
    horario: formData.horario || 'Lun–Vie 9am–6pm',
    direccion: formData.direccion || null,
    estado: 'pendiente',
    disponible: true,
    destacado: false,
    avatar_url: formData.fotoPerfil,
    galeria: formData.galeria,
    acepta_publicidad: formData.aceptaPublicidad,
  })

  if (provError) return { error: provError.message, proveedorId: null }

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

  if (filtros?.cat && filtros.cat !== 'todas') query = query.contains('cat', [filtros.cat])
  if (filtros?.suburb) query = query.eq('suburb', filtros.suburb)
  if (filtros?.soloDisponibles) query = query.eq('disponible', true)
  if (filtros?.busqueda) {
    query = query.or(
      `nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%,cat.ilike.%${filtros.busqueda}%`
    )
  }

  const { data, error } = await query.order('destacado', { ascending: false }).order('rating', { ascending: false })
  if (error) return []
  return data ?? []
}

export async function getProveedorByIdAction(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('proveedores')
    .select('*, servicios(*), resenas(*)')
    .eq('id', id)
    .single()
  if (!data) return null
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
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const supabase = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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

  const { data: rechazados } = await supabase
    .from('proveedores')
    .select('user_id')
    .eq('estado', 'rechazado')

  const idsRechazados = rechazados?.map((r: any) => r.user_id).filter(Boolean) ?? []

  let query = supabase
    .from('perfiles')
    .select('*')
    .order('fecha_registro', { ascending: false })

  if (idsRechazados.length > 0) {
    query = query.not('id', 'in', `(${idsRechazados.join(',')})`)
  }

  const { data } = await query
  return data ?? []
}

export async function getStatsAction() {
  try {
    const supabase = await createClient()
    const { count } = await supabase
      .from('proveedores')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'aprobado')
    return { totalProveedores: count ?? 0 }
  } catch {
    return { totalProveedores: 0 }
  }
}
