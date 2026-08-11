'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import { slugify, formatDate } from '@/lib/utils';
import type { Article, Category } from '@/types';

const POSTS_PER_PAGE = 15;

interface HomeClientProps {
  articles: Article[];
  categories: Category[];
}

export default function HomeClient({ articles, categories }: HomeClientProps) {
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
      <section className="hero-section">
        <div className="container-site">
          <div className="hero-content">
            <div className="hero-grid">
              <div className="hero-text">
                <h1>Descubre el Turismo Cultural</h1>
                <p>
                  Noticias, eventos, ferias y todo sobre la riqueza cultural de Argentina y el mundo.
                  Tu portal de referencia para el turismo cultural.
                </p>
                <Link href={`/categoria/destacadas`} className="btn-hero">
                  Ver destacados
                </Link>
              </div>

              {featured && (
                <Link href={`/articulo/${featured.slug || featured.id}`} className="hero-featured-card" style={{ textDecoration: 'none' }}>
                  <span className="badge">Destacado</span>
                  <h3>{featured.title}</h3>
                  <p className="excerpt">{cleanExcerpt(featured.excerpt)}</p>
                  <div className="meta">{formatDate(featured.date_created)}</div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-site" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Categories Pills */}
        <div className="categories-bar">
          {topCategories.map(cat => (
            <Link
              key={cat.id}
              href={`/categoria/${slugify(cat.name)}`}
              className="category-pill"
            >
              {cat.name}
            </Link>
          ))}
        </div>

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
            <ArticleCard key={article.id} article={article} />
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
