import Link from 'next/link';
import { UsersIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Quiénes Somos',
  description: 'Conocé más sobre Turismo Cultural, el portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
  openGraph: {
    title: 'Quiénes Somos — Turismo Cultural',
    description: 'Conocé más sobre Turismo Cultural, el portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
    url: 'https://turismocultural.com.ar/quienes-somos',
  },
  alternates: {
    canonical: 'https://turismocultural.com.ar/quienes-somos',
  },
};

export default function QuienesSomos() {
  return (
    <>
      <div className="category-header">
        <h1>Quiénes Somos</h1>
        <p>Conocé nuestro proyecto</p>
      </div>

      <div className="container-site" style={{ padding: '48px 20px', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <UsersIcon className="h-16 w-16 mx-auto" style={{ color: 'var(--color-primary)' }} />
        </div>

        <h2 style={{ color: 'var(--color-primary)', marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
          Turismo Cultural
        </h2>

        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginBottom: 16, textAlign: 'justify' }}>
          <strong>Turismo Cultural</strong> es un portal de noticias dedicado a la promoción del turismo cultural
          en Argentina y el mundo. Nuestro objetivo es difundir la riqueza cultural de nuestro país, informando
          sobre eventos, exposiciones, ferias, museos, gastronomía, capacitaciones y todo lo relacionado con
          el patrimonio cultural argentino.
        </p>

        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginBottom: 16, textAlign: 'justify' }}>
          Creemos en el turismo como motor de desarrollo cultural y económico, y trabajamos para acercar
          a nuestros lectores las mejores propuestas turísticas y culturales de cada región.
        </p>

        <p style={{ fontSize: 15, lineHeight: 1.7, color: '#555', marginBottom: 32, textAlign: 'justify' }}>
          Desde los grandes eventos en la Ciudad de Buenos Aires hasta las celebraciones tradicionales
          en cada provincia, pasando por destinos internacionales, en Turismo Cultural encontrarás
          información actualizada y contenido de calidad para planificar tus viajes y descubrir nuevas experiencias.
        </p>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link href="/" className="btn-primary small">← Volver al inicio</Link>
        </div>
      </div>
    </>
  );
}
