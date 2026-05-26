import Link from 'next/link';

export default function QuienesSomos() {
  return (
    <>
      <div className="category-header">
        <h1>Quiénes Somos</h1>
        <p>Conocé más sobre Turismo Cultural</p>
      </div>

      <div className="container-site" style={{ padding: '48px 20px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ fontSize: 17, lineHeight: 1.8, color: '#444' }}>
          <p style={{ marginBottom: 20 }}>
            <strong>Turismo Cultural</strong> es un portal de noticias dedicado a la promoción y difusión del turismo cultural en Argentina y el mundo.
          </p>
          <p style={{ marginBottom: 20 }}>
            Nuestro objetivo es brindar información actualizada sobre eventos, ferias, congresos, exposiciones, museos,
            gastronomía, y todas aquellas manifestaciones culturales que enriquecen la experiencia de viajar.
          </p>
          <p style={{ marginBottom: 20 }}>
            Creemos firmemente que el turismo es una herramienta fundamental para el desarrollo cultural, económico y social
            de las comunidades. Por eso, trabajamos para visibilizar la diversidad cultural de las 23 provincias argentinas
            y promover el intercambio con otras culturas del mundo.
          </p>
          <p style={{ marginBottom: 20 }}>
            Desde nuestros inicios, nos hemos comprometido a ofrecer contenido de calidad, verificado y relevante
            para viajeros, profesionales del turismo, gestores culturales y todos aquellos interesados en descubrir
            los tesoros culturales que Argentina tiene para ofrecer.
          </p>

          <div style={{
            background: '#f6f6f6', borderRadius: 10, padding: 24,
            marginTop: 32, border: '1px solid #e0dede'
          }}>
            <h3 style={{ marginBottom: 12, color: 'var(--color-primary)' }}>Contacto</h3>
            <p style={{ marginBottom: 8 }}>
              <strong>Email:</strong> info@turismocultural.com.ar
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>Web:</strong> www.turismocultural.com.ar
            </p>
            <p>
              <strong>Redes:</strong> Seguinos en nuestras redes para estar al día con las últimas novedades.
            </p>
          </div>

          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link href="/" className="btn-primary small">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
