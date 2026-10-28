import { connection } from 'next/server';
import { getSiteSettings, siteUrl } from '@/lib/content';
import ContactoClient from './ContactoClient';

export async function generateMetadata() {
  await connection();
  return {
    title: 'Contacto',
    description: 'Comunicate con Turismo Cultural. Envíanos tu mensaje y te responderemos a la brevedad.',
    alternates: { canonical: `${siteUrl}/contacto` },
  };
}

export default async function Contacto() {
  await connection();
  const settings = await getSiteSettings();
  return <ContactoClient settings={settings} siteUrl={siteUrl} />;
}
