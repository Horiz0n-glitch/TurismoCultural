'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import backupData from '@/data/backup.json';
import { slugify } from '@/lib/utils';
import { InboxIcon } from '@heroicons/react/24/outline';

const POSTS_PER_PAGE = 12;

export default function CategoryPage() {
  const params = useParams();
  const { articles, categories } = backupData;
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const slug = params.slug;

  // Find category
  const category = categories?.find(c => {
    const catSlug = c.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return catSlug === slug;
  });

  const categoryName = category?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  // Filter articles by this category
  const categoryArticles = useMemo(() => {
    if (!articles) return [];
    return articles
      .filter(a => {
        if (a.status !== 'publish') return false;
        // Check by category ID or name
        const catIds = a.categories_ids || [];
        const catNames = (a.category_names || []).map(n => n.toLowerCase());

        if (category && catIds.includes(category.id)) return true;

        // Also check by name match
        const categoryNameLower = categoryName.toLowerCase();
        return catNames.some(n => n.includes(categoryNameLower) || categoryNameLower.includes(n));
      })
      .sort((a, b) => new Date(b.date_created || 0) - new Date(a.date_created || 0));
  }, [articles, category, categoryName]);

  const displayedArticles = categoryArticles.slice(0, visibleCount);
  const hasMore = visibleCount < categoryArticles.length;

  // Also get subcategories if this is a province
  const subcategories = useMemo(() => {
    if (!categories) return [];
    return categories
      .filter(c => c.count > 0 && c.name !== categoryName)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }, [categories, categoryName]);

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
      {/* Category header */}
      <div className="category-header">
        <h1>{categoryName}</h1>
        <p>
          {categoryArticles.length} artículo{categoryArticles.length !== 1 ? 's' : ''}
          {category?.description ? ` — ${category.description}` : ''}
        </p>
      </div>

      <div className="container-site" style={{ paddingTop: 32, paddingBottom: 48 }}>
        {/* Breadcrumb */}
        <nav style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          <Link href="/" style={{ color: 'var(--color-primary)' }}>Inicio</Link>
          <span style={{ margin: '0 8px' }}>›</span>
          <span style={{ color: '#999' }}>{categoryName}</span>
        </nav>

        {/* Category navigation */}
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

        {/* Articles grid */}
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
              Cargar más artículos ({categoryArticles.length - visibleCount} restantes)
            </button>
          </div>
        )}
      </div>
    </>
  );
}
