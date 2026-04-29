export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cl-bg px-4">
      <div className="bg-white rounded-2xl border border-cl-gray-light p-8 max-w-md w-full text-center shadow-sm">
        <p className="text-4xl mb-4">⚠️</p>
        <h1 className="font-syne font-bold text-cl-dark text-xl mb-2">
          Link inválido o expirado
        </h1>
        <p className="text-cl-gray text-sm mb-6">
          El link de verificación ya fue usado o expiró. Por favor registrate nuevamente.
        </p>
        
          href="/registro"
          className="inline-block bg-cl-verde hover:bg-cl-verde2 text-white font-bold text-sm rounded-xl px-6 py-3 transition-colors"
        >
          Volver al registro
        </a>
      </div>
    </div>
  )
}
