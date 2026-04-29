import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export async function uploadProviderImage(
  file: File,
  userId: string,
  slot: number = 0
): Promise<string> {
  const supabase = createClientComponentClient()

  // Comprimir antes de subir
  const compressed = await compressImage(file, 1200, 0.8)

  // Ruta única por usuario: ej. "abc-123/foto_0.jpg"
  const ext = file.type === 'image/png' ? 'png' : 'jpg'
  const path = `${userId}/foto_${slot}.${ext}`

  const { error } = await supabase.storage
    .from('provider-images')
    .upload(path, compressed, {
      upsert: true,
      contentType: 'image/jpeg',
    })

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`)

  const { data } = supabase.storage
    .from('provider-images')
    .getPublicUrl(path)

  return data.publicUrl
}

async function compressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          blob ? resolve(blob) : reject(new Error('Error comprimiendo imagen'))
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('No se pudo cargar la imagen'))
    img.src = url
  })
}
