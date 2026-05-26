'use client';

export function ArticleCardSkeleton() {
  return (
    <article className="article-card" style={{ overflow: 'hidden' }}>
      <div className="skeleton skeleton-image" />
      <div className="card-body" style={{ padding: '14px 16px 16px' }}>
        <div className="skeleton skeleton-category" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-title short" style={{ width: '70%' }} />
        <div className="skeleton skeleton-text" />
        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
        <div className="skeleton skeleton-date" />
      </div>
    </article>
  );
}

export function ArticleGridSkeleton({ count = 6 }) {
  return (
    <div className="article-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="hero-section">
      <div className="container-site">
        <div className="hero-content">
          <div className="hero-grid">
            <div className="hero-text">
              <div className="skeleton skeleton-hero-title" />
              <div className="skeleton skeleton-text" style={{ width: '90%', marginBottom: 8 }} />
              <div className="skeleton skeleton-text" style={{ width: '70%', marginBottom: 20 }} />
              <div className="skeleton skeleton-btn" />
            </div>
            <div className="skeleton" style={{ width: '100%', height: 200, borderRadius: 0 }} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function ArticleDetailSkeleton() {
  return (
    <div className="article-single">
      <div className="skeleton skeleton-category" style={{ marginBottom: 12 }} />
      <div className="skeleton skeleton-title" style={{ width: '90%', height: 32, marginBottom: 8 }} />
      <div className="skeleton skeleton-title" style={{ width: '60%', height: 32, marginBottom: 16 }} />
      <div className="skeleton skeleton-date" style={{ marginBottom: 24, width: '40%' }} />
      <div className="skeleton" style={{ width: '100%', height: 400, marginBottom: 24 }} />
      <div className="skeleton skeleton-text" style={{ marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '80%', marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ marginBottom: 8 }} />
      <div className="skeleton skeleton-text" style={{ width: '50%' }} />
    </div>
  );
}

export function CategoryHeaderSkeleton() {
  return (
    <div className="category-header" style={{ padding: '30px 0' }}>
      <div style={{ maxWidth: 400, margin: '0 auto' }}>
        <div className="skeleton" style={{ width: 250, height: 32, margin: '0 auto 6px', borderRadius: 4 }} />
        <div className="skeleton" style={{ width: 180, height: 18, margin: '0 auto', borderRadius: 4 }} />
      </div>
    </div>
  );
}
