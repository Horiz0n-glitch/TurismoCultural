import collections from '../../src/config/directus-collections.json' with { type: 'json' };
import defaults from '../../src/config/editorial-defaults.json' with { type: 'json' };

export const GROUP = 'tc_editorial';
export const OWNER = 'Turismo Cultural / schema v1';
const owned = new Set([GROUP, ...Object.values(collections)]);
const translations = name => [{ language: 'es-ES', translation: name }];
const field = (name, type, label, options = {}) => ({
  field: name, type,
  meta: {
    interface: options.interface || (type === 'text' ? 'input-multiline' : type === 'boolean' ? 'boolean' : 'input'),
    translations: translations(label), required: options.required || false,
    ...(options.special ? { special: options.special } : {}),
    ...(options.options ? { options: options.options } : {}),
    ...(options.note ? { note: options.note } : {}),
    ...(options.readonly ? { readonly: true } : {}),
  },
  schema: type === 'alias' ? null : {
    is_nullable: !options.required,
    ...(options.unique ? { is_unique: true } : {}),
    ...(options.default !== undefined ? { default_value: options.default } : {}),
  },
});
const id = () => ({ field: 'id', type: 'integer', meta: { interface: 'input', hidden: true, readonly: true },
  schema: { is_primary_key: true, has_auto_increment: true, is_nullable: false } });
const related = (name, label) => field(name, 'integer', label, { interface: 'select-dropdown-m2o', special: ['m2o'] });
const status = () => field('status', 'string', 'Estado', {
  required: true, default: 'draft', interface: 'select-dropdown',
  options: { choices: [{ text: 'Borrador', value: 'draft' }, { text: 'Publicado', value: 'publish' }, { text: 'Archivado', value: 'archived' }] },
});
const collection = (key, title, icon, fields, meta = {}) => ({
  collection: collections[key], schema: {},
  meta: { icon, note: OWNER, group: GROUP, translations: translations(title), display_template: '{{title}}', ...meta },
  fields: [id(), ...fields],
});

export const definitions = [
  { collection: GROUP, schema: null, meta: { icon: 'travel_explore', note: OWNER, translations: translations('Turismo Cultural') } },
  collection('categories', 'Categorías', 'category', [
    field('name', 'string', 'Nombre', { required: true }), field('slug', 'string', 'Slug', { required: true, unique: true }),
    field('description', 'text', 'Descripción'), related('parent', 'Categoría superior'), field('sort', 'integer', 'Orden'),
  ], { display_template: '{{name}}', sort_field: 'sort' }),
  collection('authors', 'Autores', 'person', [field('name', 'string', 'Nombre', { required: true }), field('bio', 'text', 'Biografía')], { display_template: '{{name}}' }),
  collection('media', 'Medios externos', 'image', [
    field('title', 'string', 'Título'), field('url', 'string', 'URL pública'), field('alt_text', 'string', 'Texto alternativo'),
    field('post_id', 'integer', 'Referencia opcional de artículo'),
  ]),
  collection('articles', 'Artículos', 'article', [
    field('title', 'string', 'Título', { required: true }), field('slug', 'string', 'Slug', { required: true, unique: true }), status(),
    field('content_html', 'text', 'Contenido', { interface: 'input-rich-text-html' }), field('excerpt', 'text', 'Resumen'),
    field('date_created', 'timestamp', 'Fecha de creación', { special: ['date-created'], readonly: true }),
    field('date_modified', 'timestamp', 'Última modificación', { special: ['date-updated'], readonly: true }),
    related('author_id', 'Autor'), related('featured_media_id', 'Medio externo'),
    field('featured_image', 'uuid', 'Imagen principal', { interface: 'file-image', special: ['file'] }),
    field('categories', 'alias', 'Categorías', { interface: 'list-m2m', special: ['m2m'] }),
    field('link', 'string', 'Enlace de referencia'),
    field('source_key', 'string', 'Clave de origen', { unique: true, readonly: true, note: 'Evita recibir dos veces el mismo artículo. Vacío para artículos propios.' }),
    ...['site', 'collection', 'id', 'url'].map(key => field(`source_${key}`, 'string', `Origen: ${key}`, { readonly: true })),
    field('imported_at', 'timestamp', 'Fecha de recepción', { readonly: true }),
  ], { archive_field: 'status', archive_value: 'archived', unarchive_value: 'draft' }),
  collection('articleCategories', 'Relación de categorías', 'link', [related('article_id', 'Artículo'), related('category_id', 'Categoría')], { hidden: true }),
  collection('pages', 'Páginas', 'description', [
    field('title', 'string', 'Título', { required: true }), field('slug', 'string', 'Slug', { required: true, unique: true }), status(),
    field('subtitle', 'string', 'Subtítulo'), field('content_html', 'text', 'Contenido', { interface: 'input-rich-text-html' }),
    field('seo_description', 'text', 'Descripción SEO'),
  ]),
  collection('settings', 'Configuración del sitio', 'settings', Object.entries(defaults.settings).map(([key, value]) =>
    field(key, key.endsWith('description') || key === 'about_html' ? 'text' : 'string', key.replaceAll('_', ' '),
      key === 'about_html' ? { interface: 'input-rich-text-html' } : { default: value })), { singleton: true }),
  collection('navigation', 'Menú del sitio', 'menu', [
    field('label', 'string', 'Texto', { required: true }), field('href', 'string', 'Enlace', { required: true }),
    field('section', 'string', 'Sección', { required: true, interface: 'select-dropdown', options: { choices: [
      { text: 'Provincias', value: 'provinces' }, { text: 'Temas y páginas', value: 'topics' },
      { text: 'Pie: secciones', value: 'footer_sections' }, { text: 'Pie: provincias', value: 'footer_provinces' },
    ] } }), field('sort', 'integer', 'Orden'), field('enabled', 'boolean', 'Visible', { default: true }),
  ], { display_template: '{{label}}', sort_field: 'sort' }),
];

export const relations = [
  { collection: collections.categories, field: 'parent', related_collection: collections.categories },
  { collection: collections.articleCategories, field: 'article_id', related_collection: collections.articles,
    meta: { one_field: 'categories', junction_field: 'category_id', one_deselect_action: 'delete' }, schema: { on_delete: 'CASCADE' } },
  { collection: collections.articleCategories, field: 'category_id', related_collection: collections.categories,
    meta: { junction_field: 'article_id' }, schema: { on_delete: 'CASCADE' } },
  { collection: collections.articles, field: 'author_id', related_collection: collections.authors },
  { collection: collections.articles, field: 'featured_media_id', related_collection: collections.media },
  // No inverse field is added to the shared file library.
  { collection: collections.articles, field: 'featured_image', related_collection: 'directus_files' },
].map(item => ({ schema: { on_delete: 'SET NULL' }, ...item }));

export function describePlan() {
  return { namespace: GROUP, collections: definitions.map(item => item.collection), articlesToImport: 0,
    seeds: { settings: 1, pages: 1, categories: defaults.categories.length, navigation: defaults.navigation.length },
    modifiesExistingSites: false, modifiesPermissions: false, appliesWithoutFlag: false };
}

export async function provision(api) {
  // Validate every existing target before making the first write. Never adopt an unrelated table.
  // Query owned names directly: some Directus policies omit hidden collections from the root list.
  const existing = new Map();
  for (const definition of definitions) {
    try {
      existing.set(definition.collection, await api(`/collections/${definition.collection}`));
    } catch (error) {
      if (!/HTTP 404$/.test(error.message)) throw error;
    }
  }
  const fieldSets = new Map();
  for (const definition of definitions) {
    const current = existing.get(definition.collection);
    if (!current) continue;
    if (current.meta?.note !== OWNER || Boolean(current.schema) !== Boolean(definition.schema) ||
        Boolean(current.meta?.singleton) !== Boolean(definition.meta?.singleton)) {
      throw new Error(`Colisión de esquema: ${definition.collection}. No se modificó ninguna colección.`);
    }
    if (!definition.fields) continue;
    const fields = new Map((await api(`/fields/${definition.collection}`)).map(item => [item.field, item]));
    fieldSets.set(definition.collection, fields);
    for (const expected of definition.fields) {
      const actual = fields.get(expected.field);
      if (actual && (actual.type !== expected.type ||
          (expected.schema?.is_primary_key && !actual.schema?.is_primary_key) ||
          (expected.schema?.is_unique && !actual.schema?.is_unique))) {
        throw new Error(`Campo incompatible: ${definition.collection}.${expected.field}`);
      }
    }
  }
  const currentRelations = await api('/relations');
  for (const relation of relations) {
    const current = currentRelations.find(item => item.collection === relation.collection && item.field === relation.field);
    if (current && (current.related_collection !== relation.related_collection ||
        (current.meta?.one_field || null) !== (relation.meta?.one_field || null))) {
      throw new Error(`Relación incompatible: ${relation.collection}.${relation.field}`);
    }
  }
  const written = [];
  const write = async (path, body, method = 'POST') => {
    const target = path.split('/')[2];
    const allowed = path === '/collections' ? owned.has(body.collection)
      : path === '/relations' ? owned.has(body.collection) && (owned.has(body.related_collection) || body.related_collection === 'directus_files')
        : ['items', 'fields'].includes(path.split('/')[1]) && owned.has(target);
    if (!allowed) throw new Error('Escritura fuera del espacio de Turismo Cultural bloqueada.');
    written.push(path);
    return api(path, method, body);
  };
  for (const definition of definitions) {
    if (!existing.has(definition.collection)) await write('/collections', definition);
    else for (const expected of definition.fields || []) {
      if (!fieldSets.get(definition.collection)?.has(expected.field)) await write(`/fields/${definition.collection}`, expected);
    }
  }
  for (const relation of relations) {
    if (!currentRelations.some(item => item.collection === relation.collection && item.field === relation.field)) await write('/relations', relation);
  }
  const readAll = async key => {
    const items = [];
    for (;;) {
      const page = await api(`/items/${collections[key]}?limit=100&offset=${items.length}&sort=id`);
      if (!Array.isArray(page)) throw new Error(`Respuesta inválida: ${collections[key]}`);
      if (!page.length) return items;
      items.push(...page);
    }
  };
  const settings = await api(`/items/${collections.settings}`);
  if (!settings?.id) await write(`/items/${collections.settings}`, defaults.settings, 'PATCH');
  for (const [key, records, identity] of [
    ['categories', defaults.categories, item => item.slug],
    ['pages', [{ title: 'Quiénes Somos', slug: 'quienes-somos', status: 'publish', subtitle: 'Conocé nuestro proyecto', content_html: defaults.settings.about_html }], item => item.slug],
    ['navigation', defaults.navigation, item => `${item.section}:${item.href}`],
  ]) {
    const keys = new Set((await readAll(key)).map(identity));
    for (const item of records) if (!keys.has(identity(item))) await write(`/items/${collections[key]}`, item);
  }
  return { writes: written.length, articlesImported: 0 };
}
