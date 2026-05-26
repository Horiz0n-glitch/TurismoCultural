'use client';

import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/ArticleCard';
import backupData from '@/data/backup.json';
import mediaData from '@/data/media.json';
import { slugify, formatDate } from '@/lib/utils';
import { DocumentTextIcon, CalendarDaysIcon, PencilIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ArticlePageClient({ slug }) {
  const { articles, categories } = backupData;

  // Find article by slug or ID
  const article = articles.find(a => a.slug === slug || String(a.id) === slug);

  // Format date with time
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  if (!article) {
    return (
      <div className="container-site" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <DocumentTextIcon className="h-16 w-16 mx-auto" style={{ color: 'var(--color-primary)', marginBottom: 16 }} />
        <h1>Artículo no encontrado</h1>
        <p style={{ color: '#666', marginTop: 12 }}>
          El artículo que buscas no existe o ha sido movido.
        </p>
        <Link href="/" className="btn-primary small">
            Volver al inicio
        </Link>
      </div>
    );
  }

  // Find image
  const mediaItem = article.featured_media_id
    ? mediaData.find(m => m.id === article.featured_media_id)
    : null;
  const imageUrl = mediaItem?.url || null;

  // Clean content (strip excessive empty tags)
  let content = article.content_html || '';

  // Get related articles (same categories, excluding current)
  const relatedArticles = articles
    .filter(a =>
      a.id !== article.id &&
      a.category_names?.some(c => article.category_names?.includes(c))
    )
    .slice(0, 3);

  return (
    <>
      {/* Breadcrumb */}
      <div className="container-site" style={{ paddingTop: 20 }}>
        <nav style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>
          <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Inicio</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          {article.category_names?.[0] && (
            <>
              <Link href={`/categoria/${slugify(article.category_names[0])}`} style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                {article.category_names[0]}
              </Link>
              <span style={{ margin: '0 8px' }}>›</span>
            </>
          )}
          <span style={{ color: '#999' }}>{article.title?.slice(0, 60)}{article.title?.length > 60 ? '...' : ''}</span>
        </nav>
      </div>

      {/* Article */}
      <article className="article-single">
        <div className="article-header">
          {article.category_names?.[0] && (
            <Link
              href={`/categoria/${slugify(article.category_names[0])}`}
              className="article-category"
            >
              {article.category_names[0]}
            </Link>
          )}
          <h1>{article.title}</h1>
          <div className="article-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarDaysIcon className="h-4 w-4" />
              {formatDateTime(article.date_created)}
            </span>
            {article.date_modified && article.date_modified !== article.date_created && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <PencilIcon className="h-4 w-4" />
                Actualizado: {formatDate(article.date_modified)}
              </span>
            )}
            {article.author_id && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserIcon className="h-4 w-4" />
                Por: {backupData.users?.find(u => u.id === article.author_id)?.name || 'Redacción'}
              </span>
            )}
          </div>

          {/* Categories */}
          {article.category_names && article.category_names.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {article.category_names.map(cat => (
                <Link
                  key={cat}
                  href={`/categoria/${slugify(cat)}`}
                  style={{
                    display: 'inline-block', padding: '3px 10px',
                    background: '#f0f0f0', borderRadius: 4,
                    fontSize: 12, color: '#666', fontWeight: 500
                  }}
                >
                  {cat}
                </Link>
              ))}
            </div>
          )}
        </div>

        {imageUrl && (
          <div style={{ position: 'relative', width: '100%', maxHeight: 400, marginBottom: 25 }}>
            <Image
              src={imageUrl}
              alt={article.title}
              width={800}
              height={400}
              style={{ objectFit: 'cover', border: '1px solid var(--color-border)' }}
              className="featured-image"
            />
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Date metadata at the bottom */}
        <div style={{
          marginTop: 40, padding: '16px 20px',
          background: '#f9f9f9', borderRadius: 8,
          fontSize: 13, color: '#888',
          border: '1px solid #eee'
        }}>
          <div><strong>Publicado:</strong> {formatDateTime(article.date_created)}</div>
          {article.date_modified && article.date_modified !== article.date_created && (
            <div style={{ marginTop: 4 }}><strong>Actualizado:</strong> {formatDateTime(article.date_modified)}</div>
          )}
          <div style={{ marginTop: 4 }}><strong>Categorías:</strong> {article.category_names?.join(', ') || 'General'}</div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="container-site" style={{ paddingBottom: 48 }}>
          <div className="section-title">
            <h2>Artículos Relacionados</h2>
            <div className="accent-line" />
          </div>
          <div className="article-grid">
            {relatedArticles.map(art => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
