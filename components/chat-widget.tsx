'use client'
import { MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '61405851139'
const WHATSAPP_MESSAGE = '¡Hola! Te contacto desde Conectando Latinos Melbourne. Necesito ayuda con...'

export function ChatWidget() {
  function abrirWhatsApp() {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Tooltip */}
      <div className="bg-white border border-cl-gray-light rounded-xl px-3 py-2 shadow-lg max-w-[180px] text-right">
        <p className="text-cl-dark text-xs font-bold">¿Necesitás ayuda?</p>
        <p className="text-cl-gray text-[0.65rem] mt-0.5">Escribinos por WhatsApp</p>
      </div>

      {/* Botón WhatsApp */}
      <button
        onClick={abrirWhatsApp}
        className="w-14 h-14 rounded-2xl bg-[#25d366] hover:bg-[#20bc59] text-white shadow-xl flex items-center justify-center transition-all hover:scale-105"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  )
}
