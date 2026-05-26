import { ArticleGridSkeleton, HeroSkeleton } from '@/components/Skeletons';

export default function Loading() {
  return (
    <>
      <HeroSkeleton />
      <div className="container-site" style={{ paddingTop: 32, paddingBottom: 48 }}>
        <div className="section-title" style={{ marginBottom: 20 }}>
          <div className="skeleton" style={{ width: 200, height: 32, borderRadius: 0 }} />
        </div>
        <ArticleGridSkeleton count={6} />
      </div>
    </>
  );
}
