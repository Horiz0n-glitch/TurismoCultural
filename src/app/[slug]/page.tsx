import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getPage, siteUrl } from '@/lib/content';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: 'Página no encontrada' };
  return { title: page.title, description: page.seo_description || undefined, alternates: { canonical: `${siteUrl}/${slug}` } };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();
  return <>
    <div className="category-header"><h1>{page.title}</h1>{page.subtitle && <p>{page.subtitle}</p>}</div>
    <div className="container-site article-content" style={{ padding: '48px 20px', maxWidth: 800, margin: '0 auto' }} dangerouslySetInnerHTML={{ __html: page.content_html }} />
  </>;
}
