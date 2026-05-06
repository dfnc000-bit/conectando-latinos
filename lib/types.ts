// Tipos compartidos entre cliente y servidor — sin directivas 'use client' ni 'use server'

export type Servicio = { name: string; price: string }

export type Resena = {
  id: string
  autor: string
  rating: number
  comentario: string
  fecha: string
}

export type Proveedor = {
  id: string
  nombre: string
  nombreNegocio: string
  cat: string[]
  suburb: string
  disponible: boolean
  descripcion: string
  telefono: string
  instagram: string
  horario: string
  rating: number
  totalResenas: number
  servicios: Servicio[]
  galeria: string[]
  fotoPerfil: string
  resenas: Resena[]
  destacado: boolean
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'suspendido'
  fechaRegistro: string
  email: string
  direccion?: string
  lat?: number
  lng?: number
}

export type Usuario = {
  id: string
  nombre: string
  email: string
  tipo: 'cliente' | 'proveedor' | 'admin'
  suburb: string
  fechaRegistro: string
}

export const CATEGORIAS = [
  { value: 'todas', label: 'Todos', icon: '✨' },
  { value: 'Peluquería', label: 'Peluquería', icon: '✂️' },
  { value: 'Barbería', label: 'Barbería', icon: '🪒' },
  { value: 'Uñas', label: 'Uñas', icon: '💅' },
  { value: 'Pestañas', label: 'Pestañas', icon: '👁️' },
  { value: 'Cejas', label: 'Cejas', icon: '🌿' },
  { value: 'Masajes', label: 'Masajes', icon: '🤲' },
  { value: 'Faciales', label: 'Faciales', icon: '🧖' },
  { value: 'Maquillaje', label: 'Maquillaje', icon: '💄' },
  { value: 'Depilación', label: 'Depilación', icon: '🌸' },
  { value: 'Microblading', label: 'Microblading', icon: '🖊️' },
  { value: 'Bienestar', label: 'Bienestar', icon: '🧘' },
  { value: 'Tatuajes', label: 'Tatuajes', icon: '🪡' },
  { value: 'Autos', label: 'Autos', icon: '🚗' },
  { value: 'Comida', label: 'Comida', icon: '🍽️' },
  { value: 'Tecnología', label: 'Tecnología', icon: '💻' },
]

export const SUBURBIOS = [
  // Zona Central
  'Melbourne CBD', 'Docklands', 'Southbank', 'Port Melbourne',

  // Zona Oeste (más comunidad latina)
  'Footscray', 'Maribyrnong', 'Sunshine', 'St Albans', 'Werribee', 'Tarneit',
  'Point Cook', 'Hoppers Crossing', 'Wyndham Vale', 'Laverton', 'Newport',
  'Altona', 'Williamstown', 'Melton', 'Caroline Springs',
  'Truganina', 'Manor Lakes', 'Deer Park',

  // Zona Norte
  'Broadmeadows', 'Coburg', 'Brunswick', 'Essendon',
  'Reservoir', 'Preston', 'Thomastown', 'Epping',
  'Mill Park', 'South Morang', 'Lalor', 'Glenroy',

  // Zona Este
  'Box Hill', 'Springvale', 'Noble Park', 'Oakleigh',
  'Clayton', 'Mulgrave', 'Rowville', 'Glen Waverley',

  // Zona Sur
  'Dandenong', 'Cranbourne', 'Frankston', 'Cheltenham',
  'Moorabbin', 'Bentleigh', 'Mentone',
].sort()

export const GRAD_CATS: Record<string, string> = {
  'Peluquería': 'linear-gradient(135deg,#1a4a3a,#22b08c)',
  'Barbería': 'linear-gradient(135deg,#2a1a0a,#c8882a)',
  'Uñas': 'linear-gradient(135deg,#141814,#3a6a50)',
  'Pestañas': 'linear-gradient(135deg,#1a2a4a,#2a6a8a)',
  'Cejas': 'linear-gradient(135deg,#2a1a3a,#1a8a6e)',
  'Masajes': 'linear-gradient(135deg,#3a2a1a,#8a6a2a)',
  'Faciales': 'linear-gradient(135deg,#1a3a2a,#4a8a6e)',
  'Maquillaje': 'linear-gradient(135deg,#3a1a2a,#8a2a6e)',
  'Depilación': 'linear-gradient(135deg,#2a3a1a,#6a8a2a)',
  'Microblading': 'linear-gradient(135deg,#1a2a3a,#2a6a8a)',
  'Bienestar': 'linear-gradient(135deg,#2a1a3a,#6a2a8a)',
  'Tecnología': 'linear-gradient(135deg,#1a1a3a,#2a2a8a)',
  'default': 'linear-gradient(135deg,#141814,#1a8a6e)',
  'Autos': 'linear-gradient(135deg,#1a1a2a,#2a4a8a)',
  'Comida': 'linear-gradient(135deg,#2a1a0a,#8a4a1a)',
}

export function gradForCat(cat: string): string {
  return GRAD_CATS[cat] ?? GRAD_CATS['default']
}

export function iconForCat(cat: string): string {
  return CATEGORIAS.find((c) => c.value === cat)?.icon ?? '✨'
}
