'use client';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "'PT Sans', Arial, sans-serif", color: '#333', background: '#fff' }}>
        <div style={{ textAlign: 'center', padding: '80px 20px', minHeight: '100vh' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#aa0000', marginBottom: 16 }}>
            Algo salió mal
          </h1>
          <p style={{ color: '#666', maxWidth: 500, margin: '0 auto 32px' }}>
            Ocurrió un error crítico en la aplicación. Por favor, intentá nuevamente.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              background: '#aa0000',
              color: '#fff',
              border: 'none',
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              borderRadius: 2,
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}