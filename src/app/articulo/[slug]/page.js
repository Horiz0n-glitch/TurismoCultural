import backupData from '@/data/backup.json';
import ArticlePageClient from './ArticlePageClient';

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const { articles } = backupData;
  const article = articles.find(a => a.slug === slug || String(a.id) === slug);

  if (!article) {
    return {
      title: 'Artículo no encontrado — Turismo Cultural',
      description: 'El artículo que buscas no existe o ha sido movido.',
    };
  }

  const cleanExcerpt = article.excerpt
    ? article.excerpt.replace(/<[^>]+>/g, '').trim().slice(0, 160)
    : 'Noticias de turismo cultural en Argentina y el mundo.';

  return {
    title: `${article.title} — Turismo Cultural`,
    description: cleanExcerpt,
    openGraph: {
      title: `${article.title} — Turismo Cultural`,
      description: cleanExcerpt,
      type: 'article',
      locale: 'es_AR',
      siteName: 'Turismo Cultural',
      url: `https://turismocultural.com.ar/articulo/${slug}`,
      publishedTime: article.date_created,
      modifiedTime: article.date_modified,
      tags: article.category_names,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} — Turismo Cultural`,
      description: cleanExcerpt,
    },
    alternates: {
      canonical: `https://turismocultural.com.ar/articulo/${slug}`,
    },
  };
}

export default function ArticlePage({ params }) {
  return <ArticlePageClient slug={params.slug} />;
}
