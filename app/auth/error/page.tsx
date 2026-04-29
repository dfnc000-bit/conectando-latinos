export default function AuthErrorPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</p>
        <h1 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Link inválido o expirado
        </h1>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          El link de verificación ya fue usado o expiró. Por favor registrate nuevamente.
        </p>
        <a href="/registro" style={{ background: '#10b981', color: 'white', fontWeight: 'bold', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
          Volver al registro
        </a>
      </div>
    </div>
  )
}
