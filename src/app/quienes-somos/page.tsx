import Link from 'next/link';
import { connection } from 'next/server';
import { UsersIcon } from '@heroicons/react/24/outline';
import { getPage, siteUrl } from '@/lib/content';

export async function generateMetadata() {
  await connection();
  const page = await getPage('quienes-somos');
  return {
    title: page?.title || 'Quiénes Somos',
    description: page?.seo_description || 'Conocé más sobre Turismo Cultural.',
    alternates: { canonical: `${siteUrl}/quienes-somos` },
  };
}

export default async function QuienesSomos() {
  await connection();
  const page = await getPage('quienes-somos');
  return <>
    <div className="category-header"><h1>{page?.title || 'Quiénes Somos'}</h1><p>{page?.subtitle || 'Conocé nuestro proyecto'}</p></div>
    <div className="container-site" style={{ padding: '48px 20px', maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}><UsersIcon className="icon icon-xl" style={{ color: 'var(--color-primary)', margin: '0 auto' }} /></div>
      {page?.content_html && <div className="article-content" dangerouslySetInnerHTML={{ __html: page.content_html }} />}
      <div style={{ textAlign: 'center', marginTop: 24 }}><Link href="/" className="btn-primary small">← Volver al inicio</Link></div>
    </div>
  </>;
}
