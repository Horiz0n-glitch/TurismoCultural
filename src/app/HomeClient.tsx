'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import { slugify, formatDate } from '@/lib/utils';
import type { Article, Category, MediaItem } from '@/types';
import type { SiteSettings } from '@/lib/content';

const POSTS_PER_PAGE = 15;

interface HomeClientProps {
  articles: Article[];
  categories: Category[];
  media: MediaItem[];
  settings: SiteSettings;
}

export default function HomeClient({ articles, categories, media, settings }: HomeClientProps) {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('s') || '';

  const sortedArticles = useMemo(() => {
    return [...articles]
      .filter(a => a.status === 'publish')
      .sort((a, b) => new Date(b.date_created || 0).getTime() - new Date(a.date_created || 0).getTime());
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return sortedArticles;
    const q = searchQuery.toLowerCase();
    return sortedArticles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.content_html || '').toLowerCase().includes(q) ||
      (a.category_names || []).some(c => c.toLowerCase().includes(q))
    );
  }, [sortedArticles, searchQuery]);

  const displayedArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArticles.length;

  const featured = sortedArticles[0];

  const topCategories = useMemo(() => {
    if (!categories) return [];
    return [...categories]
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }, [categories]);

  const cleanExcerpt = (excerpt: string) => {
    if (!excerpt) return '';
    return excerpt.replace(/<[^>]+>/g, '').trim().slice(0, 200);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="home-hero-title">
        <div className="container-site">
          <div className="hero-content">
            <div className="hero-grid">
              <div className="hero-text">
                <div className="hero-eyebrow">
                  <span className="hero-eyebrow-mark" aria-hidden="true" />
                  {settings.hero_eyebrow}
                </div>
                <h1 id="home-hero-title">
                  {settings.hero_title} <span>{settings.hero_highlight}</span>
                </h1>
                <p>
                  {settings.hero_description}
                </p>
                <div className="hero-actions">
                  <Link href={settings.hero_cta_href} className="btn-hero">
                    {settings.hero_cta_label} <span aria-hidden="true">→</span>
                  </Link>
                  <span className="hero-caption">{settings.hero_caption}</span>
                </div>
              </div>

              {featured && (
                <Link
                  href={`/articulo/${featured.slug || featured.id}`}
                  className="hero-featured-card"
                  aria-label={`Leer artículo destacado: ${featured.title}`}
                >
                  <div className="featured-topline">
                    <span className="badge">Destacado</span>
                    <span className="featured-index" aria-hidden="true">01</span>
                  </div>
                  <div className="featured-content">
                    <h2>{featured.title}</h2>
                    <p className="excerpt">{cleanExcerpt(featured.excerpt)}</p>
                  </div>
                  <div className="featured-footer">
                    <span className="meta">{formatDate(featured.date_created)}</span>
                    <span className="featured-read">Leer nota <span aria-hidden="true">→</span></span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-site" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Categories Pills */}
        <nav className="categories-bar" aria-label="Categorías principales">
          {topCategories.map(cat => (
            <Link
              key={cat.id}
              href={`/categoria/${slugify(cat.name)}`}
              className="category-pill"
            >
              {cat.name}
            </Link>
          ))}
        </nav>

        {/* Search results header */}
        {searchQuery && (
          <div style={{ marginBottom: 24, fontSize: 18, color: '#666' }}>
            Resultados de búsqueda para: <strong style={{ color: '#333' }}>{searchQuery}</strong>
            ({filteredArticles.length} artículos)
          </div>
        )}

        {/* Latest News */}
        <div className="section-title">
          <h2>Últimas Noticias</h2>
          <div className="accent-line" />
          {filteredArticles.length > 12 && (
            <span style={{ fontSize: 13, color: '#999' }}>
              {filteredArticles.length} artículos
            </span>
          )}
        </div>

        <div className="article-grid">
          {displayedArticles.map(article => (
            <ArticleCard key={article.id} article={article} media={media} />
          ))}
        </div>

        {/* Load More */}
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
              className="btn-primary"
            >
              Cargar más artículos ({filteredArticles.length - visibleCount} restantes)
            </button>
          </div>
        )}

        {displayedArticles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ marginBottom: 8 }}>No se encontraron artículos</h3>
            <p>Intenta con otros términos de búsqueda.</p>
          </div>
        )}
      </div>
    </>
  );
}
