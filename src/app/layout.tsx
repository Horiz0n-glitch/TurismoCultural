import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getNavigation, getSiteSettings, siteUrl } from '@/lib/content';
import { connection } from 'next/server';
import './globals.css';
import type { ReactNode } from 'react';

export async function generateMetadata() {
  await connection();
  const settings = await getSiteSettings();
  const title = `${settings.site_name} — Portal de Noticias`;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${settings.site_name}` },
    description: settings.site_description,
    keywords: settings.seo_keywords,
    openGraph: { type: 'website', locale: 'es_AR', siteName: settings.site_name, title, description: settings.site_description, url: siteUrl },
    twitter: { card: 'summary_large_image', title, description: settings.site_description },
    alternates: { canonical: siteUrl },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  await connection();
  const [settings, navigation] = await Promise.all([getSiteSettings(), getNavigation()]);
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='10' fill='%23aa0000'/><path d='M30 70 L50 25 L70 70 Z' fill='white' stroke='white' stroke-width='2' stroke-linejoin='round'/><rect x='38' y='52' width='24' height='18' rx='2' fill='%23aa0000'/><circle cx='50' cy='42' r='5' fill='white'/></svg>" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#aa0000" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body>
        <Header navigation={navigation} />
        <main>{children}</main>
        <Footer settings={settings} navigation={navigation} />
      </body>
    </html>
  );
}
