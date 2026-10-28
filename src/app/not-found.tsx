import Link from 'next/link';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Página no encontrada — Turismo Cultural',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-site" style={{ textAlign: 'center', padding: '80px 20px', minHeight: '50vh' }}>
      <ExclamationCircleIcon
        className="icon icon-xl"
        style={{ color: 'var(--color-primary)', marginBottom: 16 }}
      />
      <h1 style={{ fontSize: '2.5rem', marginBottom: 12 }}>404</h1>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: 16 }}>Página no encontrada</h2>
      <p style={{ color: '#666', maxWidth: 500, margin: '0 auto 32px' }}>
        La página que buscás no existe o fue movida. Volvé al inicio para seguir explorando
        nuestras notas de turismo cultural.
      </p>
      <Link href="/" className="btn-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
