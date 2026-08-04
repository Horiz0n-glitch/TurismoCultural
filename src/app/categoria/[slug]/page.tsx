import backupData from '@/data/backup.json';
import CategoryPageClient from './CategoryPageClient';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function generateStaticParams() {
  const { categories } = backupData;
  return (categories || []).map(c => ({ slug: slugify(c.name) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { categories } = backupData;

  const category = categories?.find(c => slugify(c.name) === slug);

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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { articles, categories } = backupData;

  const category = categories?.find(c => slugify(c.name) === slug);
  const categoryName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, '');

  const categoryArticles = (articles || [])
    .filter(a => {
      if (a.status !== 'publish') return false;
      const catIds = a.categories_ids || [];
      const catNames = (a.category_names || []).map(n => n.toLowerCase());

      if (category && catIds.includes(category.id)) return true;

      const categoryNameLower = categoryName.toLowerCase();
      return catNames.some(n => n.includes(categoryNameLower) || categoryNameLower.includes(n));
    })
    .sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime());

  const subcategories = (categories || [])
    .filter(c => c.count > 0 && c.name !== categoryName)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return (
    <CategoryPageClient
      categoryName={categoryName}
      categoryArticles={categoryArticles}
      subcategories={subcategories}
      categoryDescription={category?.description || null}
    />
  );
}
