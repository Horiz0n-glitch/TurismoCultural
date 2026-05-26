export async function GET() {
  const text = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://turismocultural.com.ar/sitemap.xml
`;

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
