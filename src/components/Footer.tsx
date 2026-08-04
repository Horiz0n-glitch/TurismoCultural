import Link from 'next/link';
import { EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { slugify } from '@/lib/utils';

const QUICK_LINKS = [
  'Destacadas', 'Noticias', 'Eventos', 'Turismo', 'Capacitación'
];

const PROVINCIAS = [
  'Buenos Aires', 'Córdoba', 'Mendoza', 'Salta', 'Misiones', 'Tucumán'
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-site">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Turismo Cultural</h4>
            <p>
              Portal de noticias dedicado al turismo cultural en Argentina y el mundo.
              Información sobre eventos, ferias, exposiciones, gastronomía, museos y
              todo lo relacionado con la riqueza cultural de nuestro país.
            </p>
          </div>
          <div className="footer-col">
            <h4>Secciones</h4>
            <ul>
              {QUICK_LINKS.map(l => (
                <li key={l}>
                  <Link href={`/categoria/${slugify(l)}`}>{l}</Link>
                </li>
              ))}
              <li><Link href="/quienes-somos">Quiénes Somos</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Provincias</h4>
            <ul>
              {PROVINCIAS.map(p => (
                <li key={p}>
                  <Link href={`/categoria/${slugify(p)}`}>{p}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contacto</h4>
            <ul>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <EnvelopeIcon className="h-3.5 w-3.5" />
                <span>info@turismocultural.com.ar</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <GlobeAltIcon className="h-3.5 w-3.5" />
                <span>www.turismocultural.com.ar</span>
              </li>
              <li>&nbsp;</li>
              <li style={{ fontSize: 12, color: '#888' }}>
                © {new Date().getFullYear()} Turismo Cultural
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>TurismoCultural® — Portal de Noticias</span>
          <span>info@turismocultural.com.ar | www.turismocultural.com.ar</span>
        </div>
      </div>
    </footer>
  );
}
