import { createHash } from 'node:crypto';
import collections from '../../src/config/directus-collections.json' with { type: 'json' };

const slugify = value => String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// An explicit snapshot, never an automatic feed or a foreign key to the source article.
export async function transferArticle(api, { sourceId, sourceSite, sourceUrl = '', cmsUrl, apply = false }) {
  if (!/^[1-9]\d*$/.test(String(sourceId)) || !sourceSite?.trim() || sourceSite.length > 100) {
    throw new Error('Indicar un ID positivo y el nombre del sitio de origen (máximo 100 caracteres).');
  }
  if (sourceUrl && (!['https:', 'http:'].includes(new URL(sourceUrl).protocol) ||
      new URL(sourceUrl).username || new URL(sourceUrl).password || sourceUrl.length > 255)) {
    throw new Error('La URL de origen debe ser una URL pública HTTP(S) de hasta 255 caracteres.');
  }
  const sourceCollection = 'articulos';
  const origin = new URL(cmsUrl).href.replace(/\/+$/, '');
  const sourceKey = createHash('sha256').update(`${origin}:${sourceCollection}:${sourceId}`).digest('hex');
  const params = new URLSearchParams({ fields: 'id', limit: '1', 'filter[source_key][_eq]': sourceKey });
  const existing = await api(`/items/${collections.articles}?${params}`);
  if (!Array.isArray(existing)) throw new Error('Respuesta inválida al comprobar duplicados.');
  if (existing.length) return { state: 'already-received', id: existing[0].id };

  const fields = 'id,titulo,slug,estado,contenido,extracto,imagen_principal';
  const source = await api(`/items/${sourceCollection}/${sourceId}?fields=${fields}`);
  if (!source || source.estado !== 'publicado' || !source.titulo?.trim()) {
    throw new Error('Sólo se reciben artículos de origen publicados y con título.');
  }
  const image = typeof source.imagen_principal === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(source.imagen_principal)
    ? source.imagen_principal : null;
  const article = {
    title: source.titulo,
    slug: `${slugify(source.slug || source.titulo).slice(0, 150) || 'articulo'}-recibido-${sourceId}`,
    status: 'draft', content_html: source.contenido || '', excerpt: source.extracto || '',
    featured_image: image,
    source_key: sourceKey, source_site: sourceSite.trim(), source_collection: sourceCollection,
    source_id: String(sourceId), source_url: sourceUrl || null, imported_at: new Date().toISOString(),
  };
  if (!apply) return { state: 'planned', status: 'draft', sourceId: String(sourceId), sourceSite: sourceSite.trim() };
  // A unique source_key also rejects simultaneous duplicate sends without overwriting a copy.
  const result = await api(`/items/${collections.articles}`, 'POST', article);
  return { state: 'received', id: result.id, status: 'draft' };
}
