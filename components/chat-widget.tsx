'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Globe } from 'lucide-react'

type Message = { from: 'bot' | 'user'; text: string }

const BOT_REPLIES = [
  '¡Gracias! Te respondemos enseguida.',
  '¿Necesitás ayuda para encontrar un servicio?',
  '¡Con gusto! ¿En qué suburbio de Melbourne estás?',
  'Podemos conectarte con el profesional ideal para vos.',
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: '¡Hola! Bienvenido/a a Conectando Latinos Melbourne.' },
    { from: 'bot', text: '¿Buscás un servicio o querés registrar tu negocio?' },
  ])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  function send() {
    const val = input.trim()
    if (!val) return
    setMessages((prev) => [...prev, { from: 'user', text: val }])
    setInput('')
    setTimeout(() => {
      const reply = BOT_REPLIES[Math.floor(Math.random() * BOT_REPLIES.length)]
      setMessages((prev) => [...prev, { from: 'bot', text: reply }])
    }, 800)
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {/* Panel */}
      {open && (
        <div className="w-72 bg-white border border-cl-gray-light rounded-2xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-cl-dark px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cl-verde flex items-center justify-center flex-shrink-0">
              <Globe size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Conectando Latinos</p>
              <p className="text-white/45 text-[0.65rem]">En línea · Respondemos en español</p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-44 overflow-y-auto flex flex-col gap-2 p-3.5 bg-cl-bg">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-[0.75rem] text-xs leading-relaxed ${
                  m.from === 'bot'
                    ? 'bg-white border border-cl-gray-light self-start text-cl-dark'
                    : 'bg-cl-verde text-white self-end'
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-2.5 border-t border-cl-gray-light">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Escribí tu mensaje..."
              className="flex-1 bg-cl-bg border border-cl-gray-light rounded-lg px-3 py-2 text-xs font-jakarta text-cl-dark placeholder-cl-gray/60 outline-none focus:border-cl-verde transition-colors"
            />
            <button
              onClick={send}
              className="bg-cl-verde hover:bg-cl-verde2 text-white w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
              aria-label="Enviar"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl bg-cl-dark hover:bg-cl-verde text-white shadow-xl flex items-center justify-center transition-all hover:scale-105"
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        {open ? <X size={20} /> : <MessageCircle size={22} />}
      </button>
    </div>
  )
}
