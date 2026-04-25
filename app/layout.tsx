import type { Metadata } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['600','700','800'] })
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', weight: ['300','400','500','600','700'] })

export const metadata: Metadata = {
  title: 'Conectando Latinos — Melbourne, Australia',
  description: 'La plataforma que conecta a la comunidad latina en Melbourne con servicios de belleza y bienestar en español.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
   <html lang="es" className={`${syne.variable} ${plusJakarta.variable}`} style={{ backgroundColor: '#141814' }}>
     <body className="font-jakarta antialiased" style={{ backgroundColor: '#141814', color: '#ffffff' }}>
        {children}
      </body>
    </html>
  )
}
