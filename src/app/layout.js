import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata = {
  title: {
    default: 'Turismo Cultural — Portal de Noticias',
    template: '%s — Turismo Cultural',
  },
  description: 'Portal de noticias dedicado al turismo cultural en Argentina y el mundo. Información sobre eventos, ferias, exposiciones, gastronomía, museos y cultura.',
  keywords: 'turismo cultural, argentina, noticias turismo, cultura, eventos, museos, gastronomía, turismo argentina, turismo cultural argentina',
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    siteName: 'Turismo Cultural',
    title: 'Turismo Cultural — Portal de Noticias',
    description: 'Portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
    url: 'https://turismocultural.com.ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Turismo Cultural — Portal de Noticias',
    description: 'Portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
  },
  alternates: {
    canonical: 'https://turismocultural.com.ar',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='10' fill='%23aa0000'/><path d='M30 70 L50 25 L70 70 Z' fill='white' stroke='white' stroke-width='2' stroke-linejoin='round'/><rect x='38' y='52' width='24' height='18' rx='2' fill='%23aa0000'/><circle cx='50' cy='42' r='5' fill='white'/></svg>" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#aa0000" />
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
