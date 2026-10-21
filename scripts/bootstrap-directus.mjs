#!/usr/bin/env node
// Run from the repository root against a new Directus instance.
// Requires DIRECTUS_URL, DIRECTUS_ADMIN_EMAIL, DIRECTUS_ADMIN_PASSWORD.
import { readFile } from 'node:fs/promises';

const base = process.env.DIRECTUS_URL?.replace(/\/+$/, '');
const email = process.env.DIRECTUS_ADMIN_EMAIL;
const password = process.env.DIRECTUS_ADMIN_PASSWORD;
if (!base || !email || !password) {
  throw new Error('Set DIRECTUS_URL, DIRECTUS_ADMIN_EMAIL and DIRECTUS_ADMIN_PASSWORD');
}

async function raw(path, method = 'GET', body, token) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status} ${JSON.stringify(data)}`);
  return data.data;
}

const auth = await raw('/auth/login', 'POST', { email, password });
const token = auth.access_token;
const api = (path, method = 'GET', body) => raw(path, method, body, token);

const field = (name, type, options = {}) => ({
  field: name,
  type,
  meta: {
    interface: options.interface || (type === 'text' ? 'input-multiline' : type === 'boolean' ? 'boolean' : 'input'),
    ...(options.options ? { options: options.options } : {}),
    ...(options.note ? { note: options.note } : {}),
    ...(options.hidden ? { hidden: true } : {}),
  },
  schema: { is_nullable: options.required ? false : true, ...(options.default !== undefined ? { default_value: options.default } : {}), ...(options.unique ? { is_unique: true } : {}) },
});

const collectionDefs = [
  ['categories', 'Categorías', 'category', [
    field('name', 'string', { required: true }), field('slug', 'string', { required: true, unique: true }),
    field('description', 'text'), field('parent', 'integer'), field('sort', 'integer'),
  ]],
  ['authors', 'Autores', 'person', [field('name', 'string', { required: true }), field('bio', 'text')]],
  ['media', 'Archivo multimedia heredado', 'image', [
    field('title', 'string'), field('url', 'string', { note: 'URL pública de la imagen heredada' }),
    field('alt_text', 'string'), field('post_id', 'integer'),
  ]],
  ['articles', 'Artículos', 'article', [
    field('title', 'string', { required: true }), field('slug', 'string', { required: true, unique: true }),
    field('status', 'string', { required: true, default: 'draft', interface: 'select-dropdown', options: { choices: [
      { text: 'Borrador', value: 'draft' }, { text: 'Publicado', value: 'publish' }, { text: 'Archivado', value: 'archived' },
    ] } }),
    field('content_html', 'text', { interface: 'input-rich-text-html' }), field('excerpt', 'text'),
    field('date_created', 'dateTime'), field('date_modified', 'dateTime'),
    field('author_id', 'integer'), field('featured_media_id', 'integer'),
    field('featured_image', 'uuid', { interface: 'file-image', note: 'Imagen cargada en Directus' }),
    field('link', 'string'),
  ]],
  ['articles_categories', 'Categorías de artículos', 'link', [
    field('article_id', 'integer', { required: true }), field('category_id', 'integer', { required: true }),
  ]],
  ['pages', 'Páginas', 'description', [
    field('title', 'string', { required: true }), field('slug', 'string', { required: true, unique: true }),
    field('status', 'string', { default: 'draft', interface: 'select-dropdown', options: { choices: [
      { text: 'Borrador', value: 'draft' }, { text: 'Publicado', value: 'publish' },
    ] } }), field('subtitle', 'string'), field('content_html', 'text', { interface: 'input-rich-text-html' }),
    field('seo_description', 'text'),
  ]],
  ['site_settings', 'Configuración del sitio', 'settings', [
    field('site_name', 'string'), field('site_description', 'text'),
    field('hero_eyebrow', 'string'), field('hero_title', 'string'), field('hero_highlight', 'string'),
    field('hero_description', 'text'), field('hero_cta_label', 'string'), field('hero_cta_href', 'string'),
    field('hero_caption', 'string'), field('about_html', 'text', { interface: 'input-rich-text-html' }),
    field('contact_email', 'string'), field('contact_location', 'string'),
    field('facebook_url', 'string'), field('instagram_url', 'string'), field('x_url', 'string'),
    field('footer_description', 'text'), field('seo_keywords', 'text'),
  ]],
  ['navigation_items', 'Menú del sitio', 'menu', [
    field('label', 'string', { required: true }), field('href', 'string', { required: true }),
    field('section', 'string', { required: true, interface: 'select-dropdown', options: { choices: [
      { text: 'Provincias', value: 'provinces' }, { text: 'Temas y páginas', value: 'topics' },
      { text: 'Pie: secciones', value: 'footer_sections' }, { text: 'Pie: provincias', value: 'footer_provinces' },
    ] } }), field('sort', 'integer'), field('enabled', 'boolean', { default: true }),
  ]],
];

const existing = new Set((await api('/collections')).map(item => item.collection));
for (const [name, title, icon, fields] of collectionDefs) {
  if (existing.has(name)) continue;
  await api('/collections', 'POST', {
    collection: name,
    schema: { name },
    meta: { icon, note: title, display_template: '{{title}}' },
    fields,
  });
  console.log(`Colección creada: ${name}`);
}

const relations = await api('/relations');
const relationExists = (collection, field) => relations.some(item => item.collection === collection && item.field === field);
for (const relation of [
  { collection: 'articles_categories', field: 'article_id', related_collection: 'articles', meta: { one_field: 'category_links' } },
  { collection: 'articles_categories', field: 'category_id', related_collection: 'categories', meta: { one_field: 'article_links' } },
  { collection: 'articles', field: 'author_id', related_collection: 'authors' },
  { collection: 'articles', field: 'featured_image', related_collection: 'directus_files' },
]) {
  if (!relationExists(relation.collection, relation.field)) {
    await api('/relations', 'POST', relation);
    console.log(`Relación creada: ${relation.collection}.${relation.field}`);
  }
}

async function createMissing(collection, records) {
  const existingIds = new Set();
  let offset = 0;
  while (true) {
    const page = await api(`/items/${collection}?fields=id&limit=500&offset=${offset}`);
    page.forEach(item => existingIds.add(Number(item.id)));
    if (page.length < 500) break;
    offset += page.length;
  }
  const missing = records.filter(record => !record.id || !existingIds.has(Number(record.id)));
  let created = 0;
  for (let index = 0; index < missing.length; index += 100) {
    const batch = missing.slice(index, index + 100);
    if (batch.length) await api(`/items/${collection}`, 'POST', batch);
    created += batch.length;
  }
  console.log(`${collection}: ${created} registros creados`);
}

const backup = JSON.parse(await readFile('src/data/backup.json', 'utf8'));
const media = JSON.parse(await readFile('src/data/media.json', 'utf8'));
await createMissing('categories', backup.categories.map(item => ({
  id: item.id, name: item.name, slug: item.slug, description: item.description || null,
  parent: item.parent || null,
})));
await createMissing('authors', backup.users.map(item => ({ id: item.id, name: item.name })));
await createMissing('media', media.map(item => ({
  id: item.id, title: item.title || null, url: item.url || null,
  alt_text: item.alt_text || null, post_id: item.post_id || null,
})));
await createMissing('articles', backup.articles.map(item => ({
  id: item.id, title: item.title, slug: item.slug, status: item.status,
  content_html: item.content_html, excerpt: item.excerpt || null,
  date_created: item.date_created || null, date_modified: item.date_modified || null,
  author_id: item.author_id || null, featured_media_id: item.featured_media_id || null,
  link: item.link || null,
})));

const links = backup.articles.flatMap(item => (item.categories_ids || []).map(categoryId => ({
  id: Number(`${item.id}${String(categoryId).padStart(3, '0')}`),
  article_id: item.id,
  category_id: categoryId,
})));
await createMissing('articles_categories', links);

const settings = [{
  id: 1,
  site_name: 'Turismo Cultural',
  site_description: 'Portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
  hero_eyebrow: 'Revista de turismo y cultura',
  hero_title: 'Descubre', hero_highlight: 'el Turismo Cultural',
  hero_description: 'Noticias, eventos, ferias y todo sobre la riqueza cultural de Argentina y el mundo. Tu portal de referencia para el turismo cultural.',
  hero_cta_label: 'Ver destacados', hero_cta_href: '/categoria/destacadas',
  hero_caption: 'Argentina y el mundo',
  about_html: '<p><strong>Turismo Cultural</strong> es un portal de noticias dedicado a la promoción del turismo cultural en Argentina y el mundo.</p><p>Difundimos eventos, exposiciones, ferias, museos, gastronomía y patrimonio cultural.</p>',
  contact_email: 'info@turismocultural.com.ar', contact_location: 'Argentina',
  footer_description: 'Portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
  seo_keywords: 'turismo cultural, argentina, cultura, eventos, museos, gastronomía',
}];
await createMissing('site_settings', settings);
await createMissing('pages', [
  ...(backup.pages || []).filter(item => item.slug && item.slug !== 'quienes-somos').map(item => ({
    id: item.id, title: item.title, slug: item.slug, status: 'draft',
    subtitle: '', content_html: item.content_html || '', seo_description: '',
  })),
  { id: 1, title: 'Quiénes Somos', slug: 'quienes-somos', status: 'publish', subtitle: 'Conocé nuestro proyecto', content_html: settings[0].about_html },
]);

const provinceSlugs = ['buenos-aires','ciudad-de-buenos-aires','catamarca','chaco','chubut','cordoba','corrientes','entre-rios','formosa','jujuy','la-pampa','la-rioja','mendoza','misiones','neuquen','rio-negro','salta','san-juan','san-luis','santa-cruz','santa-fe','santiago-del-estero','tierra-del-fuego','tucuman','latinoamerica','resto-del-mundo'];
const provinceLabels = ['Buenos Aires','CABA','Catamarca','Chaco','Chubut','Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja','Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis','Santa Cruz','Santa Fé','Sgo. del Estero','Tierra del Fuego','Tucumán','Latinoamérica','Resto del mundo'];
const topics = ['Destacadas','Noticias','Eventos','Turismo','Gastronómico','Capacitación','Museos','Ferias y Congresos','Recorridos','Cultura','Curiosidades','Ambiente','RSE','Breves'];
const topicSlugs = ['destacadas','noticias','eventos','turismo','gastronomico','capacitacion','museos','ferias-y-congresos','recorridos','cultura','curiosidades','ambiente','rse','breves'];
const nav = [
  ...provinceLabels.map((label, index) => ({ label, href: `/categoria/${provinceSlugs[index]}`, section: 'provinces', sort: index + 1 })),
  ...topics.map((label, index) => ({ label, href: `/categoria/${topicSlugs[index]}`, section: 'topics', sort: index + 1 })),
  { label: 'Quiénes Somos', href: '/quienes-somos', section: 'topics', sort: 15 },
  { label: 'Servicios', href: '/categoria/servicios', section: 'topics', sort: 16 },
  { label: 'Contacto', href: '/contacto', section: 'topics', sort: 17 },
  ...['Destacadas','Noticias','Eventos','Turismo','Capacitación'].map((label, index) => ({ label, href: `/categoria/${['destacadas','noticias','eventos','turismo','capacitacion'][index]}`, section: 'footer_sections', sort: index + 1 })),
  ...['Buenos Aires','Córdoba','Mendoza','Salta','Misiones','Tucumán'].map((label, index) => ({ label, href: `/categoria/${['buenos-aires','cordoba','mendoza','salta','misiones','tucuman'][index]}`, section: 'footer_provinces', sort: index + 1 })),
].map((item, index) => ({ id: index + 1, ...item, enabled: true }));
await createMissing('navigation_items', nav);
console.log('Importación inicial finalizada. Los cambios futuros se editan en Directus.');
