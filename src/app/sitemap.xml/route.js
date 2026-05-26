import backupData from '@/data/backup.json';

const SITE_URL = 'https://turismocultural.com.ar';

export async function GET() {
  const { articles, categories } = backupData;

  // Static pages
  const staticPages = [
    { loc: '', lastmod: '2026-05-25', priority: '1.0' },
    { loc: '/quienes-somos', lastmod: '2026-05-25', priority: '0.8' },
    { loc: '/contacto', lastmod: '2026-05-25', priority: '0.7' },
  ];

  // Category pages
  const categoryPages = (categories || []).map(cat => {
    const slug = cat.name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return {
      loc: `/categoria/${slug}`,
      lastmod: '2026-05-25',
      priority: '0.7',
    };
  });

  // Article pages
  const articlePages = (articles || [])
    .filter(a => a.status === 'publish')
    .map(article => {
      const slug = article.slug || String(article.id);
      const date = article.date_modified || article.date_created || '2026-05-25';
      return {
        loc: `/articulo/${slug}`,
        lastmod: date.slice(0, 10),
        priority: '0.6',
      };
    });

  const allPages = [...staticPages, ...categoryPages, ...articlePages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.loc}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.loc === '' ? 'daily' : page.loc.startsWith('/articulo') ? 'monthly' : 'weekly'}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
