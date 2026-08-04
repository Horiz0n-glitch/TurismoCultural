'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { slugify } from '@/lib/utils';
import { InboxIcon } from '@heroicons/react/24/outline';
import type { Article, Category } from '@/types';

const POSTS_PER_PAGE = 12;

interface CategoryPageClientProps {
  categoryName: string;
  categoryArticles: Article[];
  subcategories: Category[];
  categoryDescription: string | null;
}

export default function CategoryPageClient({ categoryName, categoryArticles, subcategories, categoryDescription }: CategoryPageClientProps) {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  const displayedArticles = categoryArticles.slice(0, visibleCount);
  const hasMore = visibleCount < categoryArticles.length;

  if (categoryArticles.length === 0) {
    return (
      <>
        <div className="category-header">
          <h1>{categoryName}</h1>
          <p>Explora artículos sobre {categoryName}</p>
        </div>
        <div className="container-site" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <InboxIcon className="h-12 w-12 mx-auto" style={{ color: 'var(--color-primary)', marginBottom: 12 }} />
          <h3>No hay artículos en esta categoría</h3>
          <p style={{ color: '#666', marginTop: 12 }}>
            Pronto agregaremos contenido nuevo.
          </p>
          <Link href="/" className="btn-primary small">
            Volver al inicio
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="category-header">
        <h1>{categoryName}</h1>
        <p>
          {categoryArticles.length} artículo{categoryArticles.length !== 1 ? 's' : ''}
          {categoryDescription ? ` — ${categoryDescription}` : ''}
        </p>
      </div>

      <div className="container-site" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <nav style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          <Link href="/" style={{ color: 'var(--color-primary)' }}>Inicio</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#999' }}>{categoryName}</span>
        </nav>

        <div className="categories-bar">
          <Link href="/" className="category-pill">Todas las categorías</Link>
          {subcategories.slice(0, 12).map(cat => (
            <Link
              key={cat.id}
              href={`/categoria/${slugify(cat.name)}`}
              className="category-pill"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="article-grid">
          {displayedArticles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
              className="btn-primary"
            >
              Cargar más artículos ({categoryArticles.length - visibleCount} restantes)
            </button>
          </div>
        )}
      </div>
    </>
  );
}
