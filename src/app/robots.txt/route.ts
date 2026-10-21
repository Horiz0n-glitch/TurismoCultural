import { connection } from 'next/server';
import { siteUrl } from '@/lib/content';

export async function GET() {
  await connection();
  const text = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
