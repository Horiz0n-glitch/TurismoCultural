'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error('[App Error]', error);
  }, [error]);

  return (
    <div className="container-site" style={{ textAlign: 'center', padding: '80px 20px', minHeight: '50vh' }}>
      <ExclamationTriangleIcon
        className="h-20 w-20 mx-auto"
        style={{ color: 'var(--color-primary)', marginBottom: 16 }}
      />
      <h1 style={{ fontSize: '2.5rem', marginBottom: 12 }}>Algo salió mal</h1>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: 16 }}>Error inesperado</h2>
      <p style={{ color: '#666', maxWidth: 500, margin: '0 auto 32px' }}>
        Ocurrió un problema al cargar esta página. Podés intentar nuevamente o volver al inicio.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => unstable_retry()} className="btn-primary">
          Reintentar
        </button>
        <Link href="/" className="btn-primary" style={{ background: '#666' }}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}