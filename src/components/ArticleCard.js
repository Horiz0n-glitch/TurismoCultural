import Link from 'next/link';
import mediaData from '@/data/media.json';
import { PhotoIcon } from '@heroicons/react/24/outline';

export default function ArticleCard({ article, showCategory = true, variant = 'default' }) {
  const { id, title, slug, excerpt, date_created, categories_ids, category_names, featured_media_id } = article;

  // Find the image
  const mediaItem = featured_media_id
    ? mediaData.find(m => m.id === featured_media_id)
    : null;
  const imageUrl = mediaItem?.url || null;

  // Clean excerpt
  const cleanExcerpt = excerpt
    ? excerpt.replace(/<[^>]+>/g, '').trim()
    : '';

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-AR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Category slug from names
  const displayCategory = category_names?.[0] || 'General';
  const categorySlug = displayCategory
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (variant === 'compact') {
    return (
      <article className="article-card" style={{ flexDirection: 'row', minHeight: 100 }}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="card-image"
            style={{ width: 120, height: 100, flexShrink: 0, borderBottom: 'none', borderRight: '1px solid var(--color-border)' }}
            loading="lazy"
          />
        ) : (
          <div className="card-image-placeholder" style={{ width: 120, height: 100, flexShrink: 0, fontSize: 20 }}>
            <PhotoIcon className="h-6 w-6" />
          </div>
        )}
        <div className="card-body" style={{ padding: '10px 14px' }}>
          <h4 className="card-title" style={{ fontSize: '0.9rem', marginBottom: 4 }}>
            <Link href={`/articulo/${slug || id}`}>{title}</Link>
          </h4>
          <div className="card-meta" style={{ borderTop: 'none', paddingTop: 0 }}>
            <span className="date">{formatDate(date_created)}</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="article-card">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="card-image"
          loading="lazy"
        />
      ) : (
        <div className="card-image-placeholder">
          <PhotoIcon className="h-9 w-9" />
        </div>
      )}
      <div className="card-body">
        {showCategory && (
          <Link href={`/categoria/${categorySlug}`} className="card-category">
            {displayCategory}
          </Link>
        )}
        <h3 className="card-title">
          <Link href={`/articulo/${slug || id}`}>{title}</Link>
        </h3>
        <p className="card-excerpt">
          {cleanExcerpt.slice(0, 200)}...
        </p>
        <div className="card-meta">
          <span className="date">{formatDate(date_created)}</span>
        </div>
      </div>
    </article>
  );
}
