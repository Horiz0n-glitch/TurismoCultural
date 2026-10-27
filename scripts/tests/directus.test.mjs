import test from 'node:test';
import assert from 'node:assert/strict';
import { provision, describePlan } from '../directus/schema.mjs';
import { createClient } from '../directus/client.mjs';
import { transferArticle } from '../directus/transfer.mjs';

function mockCms() {
  const tables = new Map([
    ['articulos', { collection: 'articulos', schema: {}, meta: { note: 'Habitat' }, fields: [] }],
    ['categorias', { collection: 'categorias', schema: {}, meta: {}, fields: [] }],
  ]);
  const records = new Map([
    ['articulos', [{ id: 23, titulo: 'Fuente pública', estado: 'publicado', slug: 'fuente-publica', contenido: '<p>Texto de origen</p>', extracto: 'Resumen' }]],
    ['categorias', [{ id: 1, name: 'Categoría ajena' }]],
  ]);
  const relations = [];
  const writes = [];
  let deny = null;
  const api = async (path, method = 'GET', body) => {
    const url = new URL(path, 'https://cms.example');
    const parts = url.pathname.split('/').filter(Boolean);
    if (deny === url.pathname) throw new Error('HTTP 403');
    if (method !== 'GET') writes.push({ path: url.pathname, method, body: structuredClone(body) });
    if (path === '/collections') {
      if (method === 'POST') { tables.set(body.collection, structuredClone(body)); return body; }
      return [...tables.values()];
    }
    if (parts[0] === 'fields') {
      const fields = tables.get(parts[1]).fields;
      if (method === 'POST') { fields.push(structuredClone(body)); return body; }
      return fields;
    }
    if (path === '/relations') {
      if (method === 'POST') { relations.push(structuredClone(body)); return body; }
      return relations;
    }
    assert.equal(parts[0], 'items');
    const name = parts[1];
    const items = records.get(name) || [];
    if (method === 'POST') {
      if (body.source_key && items.some(item => item.source_key === body.source_key)) throw new Error('Unique violation');
      const item = { id: items.length + 1, ...structuredClone(body) };
      items.push(item); records.set(name, items); return structuredClone(item);
    }
    if (name === 'tc_site_settings') return items[0] || null;
    if (parts[2]) return structuredClone(items.find(item => String(item.id) === parts[2]));
    const key = url.searchParams.get('filter[source_key][_eq]');
    const filtered = key ? items.filter(item => item.source_key === key) : items;
    // Simulate a server-side page cap lower than the requested limit.
    const offset = Number(url.searchParams.get('offset') || 0);
    return structuredClone(filtered.slice(offset, offset + 2));
  };
  return { api, records, tables, writes, setDenied: value => { deny = value; } };
}

const transferOptions = { sourceId: '23', sourceSite: 'Habitat', cmsUrl: 'https://cms.example' };

test('provisioning starts with zero articles and preserves other sites; rerunning preserves editorial edits', async () => {
  const cms = mockCms();
  const source = structuredClone(cms.records.get('articulos'));
  const categories = structuredClone(cms.records.get('categorias'));
  assert.equal(describePlan().articlesToImport, 0);
  await provision(cms.api);
  assert.deepEqual(cms.records.get('articulos'), source);
  assert.deepEqual(cms.records.get('categorias'), categories);
  assert.equal(cms.records.get('tc_articles')?.length || 0, 0);
  assert.equal(cms.records.get('tc_authors')?.length || 0, 0);
  assert.ok(cms.writes.every(write => write.method === 'POST' &&
    (write.path === '/collections' ? write.body.collection.startsWith('tc_') :
      write.path === '/relations' ? write.body.collection.startsWith('tc_') : write.path.startsWith('/items/tc_'))));
  const settings = cms.records.get('tc_site_settings')[0];
  settings.hero_title = 'Texto editado por el usuario';
  const before = cms.writes.length;
  assert.equal((await provision(cms.api)).writes, 0);
  assert.equal(cms.writes.length, before);
  assert.equal(settings.hero_title, 'Texto editado por el usuario');
});

test('a pre-existing namespace collision aborts before any mutation', async () => {
  const cms = mockCms();
  cms.tables.set('tc_pages', { collection: 'tc_pages', schema: {}, meta: { note: 'Otro proyecto' } });
  await assert.rejects(provision(cms.api), /Colisión/);
  assert.equal(cms.writes.length, 0);
});

test('a missing own field can resume safely; an incompatible field aborts the whole preflight', async () => {
  const cms = mockCms();
  await provision(cms.api);
  const table = cms.tables.get('tc_articles');
  table.fields = table.fields.filter(item => item.field !== 'source_url');
  const before = cms.writes.length;
  await provision(cms.api);
  assert.equal(cms.writes.length, before + 1);
  assert.equal(cms.writes.at(-1).path, '/fields/tc_articles');
  table.fields.find(item => item.field === 'title').type = 'integer';
  const count = cms.writes.length;
  await assert.rejects(provision(cms.api), /Campo incompatible/);
  assert.equal(cms.writes.length, count);
});

test('preview is read-only; a received snapshot is draft and subsequent sends never overwrite local edits', async () => {
  const cms = mockCms();
  const source = structuredClone(cms.records.get('articulos'));
  assert.equal((await transferArticle(cms.api, transferOptions)).state, 'planned');
  assert.equal(cms.writes.length, 0);
  const received = await transferArticle(cms.api, { ...transferOptions, apply: true });
  assert.equal(received.status, 'draft');
  const article = cms.records.get('tc_articles')[0];
  assert.equal(article.status, 'draft');
  assert.equal(article.content_html, source[0].contenido);
  assert.equal(article.source_collection, 'articulos');
  assert.equal(article.source_id, '23');
  assert.equal(article.author_id, undefined);
  article.title = 'Versión editada localmente'; article.status = 'publish';
  cms.records.get('articulos')[0].contenido = '<p>Cambio posterior en el origen</p>';
  assert.equal((await transferArticle(cms.api, { ...transferOptions, sourceSite: 'Otro nombre', apply: true })).state, 'already-received');
  assert.equal(cms.writes.length, 1);
  assert.equal(article.title, 'Versión editada localmente');
  assert.equal(article.content_html, source[0].contenido);
});

test('a source draft or insufficient source permission cannot create a copy', async () => {
  const cms = mockCms();
  cms.records.get('articulos')[0].estado = 'borrador';
  await assert.rejects(transferArticle(cms.api, { ...transferOptions, apply: true }), /publicados/);
  cms.setDenied('/items/articulos/23');
  await assert.rejects(transferArticle(cms.api, { ...transferOptions, apply: true }), /403/);
  assert.equal(cms.writes.length, 0);
});

test('the unique origin rejects simultaneous sends instead of replacing the first copy', async () => {
  const cms = mockCms();
  const results = await Promise.allSettled([1, 2].map(() => transferArticle(cms.api, { ...transferOptions, apply: true })));
  assert.equal(results.filter(item => item.status === 'fulfilled').length, 1);
  assert.equal(cms.records.get('tc_articles').length, 1);
});

test('operator credentials cannot follow redirects or be sent over public HTTP; API errors hide private bodies', async () => {
  assert.throws(() => createClient('http://public.example', 'synthetic'), /HTTPS/);
  let options;
  const api = createClient('https://cms.example', 'synthetic', async (_url, init) => {
    options = init;
    return new Response(JSON.stringify({ secret: 'never-show-this' }), { status: 403 });
  });
  await assert.rejects(api('/collections'), error => !error.message.includes('never-show-this') && error.message.includes('403'));
  assert.equal(options.redirect, 'error');
});
