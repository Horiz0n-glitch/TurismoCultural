import backupData from '@/data/backup.json';
import mediaData from '@/data/media.json';
import ArticlePageClient from './ArticlePageClient';

export async function generateStaticParams() {
  const { articles } = backupData;
  return articles
    .filter(a => a.status === 'publish')
    .map(a => ({ slug: a.slug || String(a.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { articles, users } = backupData;
  const article = articles.find(a => a.slug === slug || String(a.id) === slug);

  if (!article) {
    return <ArticlePageClient article={null} />;
  }

  const mediaItem = article.featured_media_id
    ? mediaData.find(m => m.id === article.featured_media_id)
    : null;
  const firstImgMatch = article.content_html?.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  const imageUrl = mediaItem?.url || (firstImgMatch ? firstImgMatch[1] : null);

  const authorName = users?.find(u => u.id === article.author_id)?.name || null;

  const relatedArticles = articles
    .filter(a =>
      a.id !== article.id &&
      a.category_names?.some(c => article.category_names?.includes(c))
    )
    .slice(0, 3);

  return (
    <ArticlePageClient
      article={article}
      imageUrl={imageUrl}
      authorName={authorName}
      relatedArticles={relatedArticles}
    />
  );
}
