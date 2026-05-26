import backupData from '@/data/backup.json';
import CategoryPageClient from './CategoryPageClient';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const { categories } = backupData;

  const category = categories?.find(c => {
    const catSlug = c.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return catSlug === slug;
  });

  const categoryName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  return {
    title: `${categoryName} — Turismo Cultural`,
    description: `Artículos sobre ${categoryName} en Turismo Cultural. Noticias, eventos, ferias y todo sobre el turismo cultural en Argentina.`,
    openGraph: {
      title: `${categoryName} — Turismo Cultural`,
      description: `Artículos sobre ${categoryName} en Turismo Cultural.`,
      locale: 'es_AR',
      siteName: 'Turismo Cultural',
      url: `https://turismocultural.com.ar/categoria/${slug}`,
    },
    alternates: {
      canonical: `https://turismocultural.com.ar/categoria/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  return <CategoryPageClient slug={slug} />;
}
