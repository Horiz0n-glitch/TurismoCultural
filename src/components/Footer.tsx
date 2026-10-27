import Link from 'next/link';
import { EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import type { NavigationItem, SiteSettings } from '@/lib/content';
import { siteUrl } from '@/lib/content';

export default function Footer({ settings, navigation }: { settings: SiteSettings; navigation: NavigationItem[] }) {
  const sections = navigation.filter(item => item.section === 'footer_sections');
  const provinces = navigation.filter(item => item.section === 'footer_provinces');
  return (
    <footer className="site-footer">
      <div className="container-site">
        <div className="footer-grid">
          <div className="footer-col"><h4>{settings.site_name}</h4><p>{settings.footer_description}</p></div>
          {sections.length > 0 && <div className="footer-col"><h4>Secciones</h4><ul>
            {sections.map(item => <li key={item.id}><Link href={item.href}>{item.label}</Link></li>)}
          </ul></div>}
          {provinces.length > 0 && <div className="footer-col"><h4>Provincias</h4><ul>
            {provinces.map(item => <li key={item.id}><Link href={item.href}>{item.label}</Link></li>)}
          </ul></div>}
          <div className="footer-col"><h4>Contacto</h4><ul>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><EnvelopeIcon className="icon icon-xs" /><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><GlobeAltIcon className="icon icon-xs" /><a href={siteUrl}>{new URL(siteUrl).host}</a></li>
            <li>&nbsp;</li><li style={{ fontSize: 12, color: '#888' }}>© {new Date().getFullYear()} {settings.site_name}</li>
          </ul></div>
        </div>
        <div className="footer-bottom"><span>{settings.site_name}® — Portal de Noticias</span><span>{settings.contact_email} | {new URL(siteUrl).host}</span></div>
      </div>
    </footer>
  );
}
