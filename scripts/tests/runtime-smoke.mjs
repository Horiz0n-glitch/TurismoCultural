// Run after npm run build. Uses only a synthetic CMS on loopback and a temporary Next server.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { cp } from 'node:fs/promises';
import defaults from '../../src/config/editorial-defaults.json' with { type: 'json' };
import collections from '../../src/config/directus-collections.json' with { type: 'json' };

const requests = [];
const browserTests = process.argv.includes('--browser');
if (browserTests) {
  // Mirror the asset copies in the production Dockerfile before browser checks.
  await cp('public', '.next/standalone/public', { recursive: true });
  await cp('.next/static', '.next/standalone/.next/static', { recursive: true });
}
let broken = false;
const fixture = createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const [scenario, resource, name] = url.pathname.split('/').filter(Boolean);
  assert.equal(req.headers.authorization, 'Bearer synthetic-runtime-token');
  requests.push({ scenario, resource, name, params: url.searchParams });
  res.setHeader('Content-Type', 'application/json');
  if (resource !== 'items' || !Object.values(collections).includes(name) || (broken && name === collections.categories)) {
    res.writeHead(403); res.end(JSON.stringify({ errors: [{ message: 'Denied' }] })); return;
  }
  if (name === collections.settings) { res.end(JSON.stringify({ data: { id: 1, ...defaults.settings } })); return; }
  const article = { id: 11, title: 'PUBLICACION_PROPIA_TC', slug: 'publicacion-propia', status: 'publish',
    content_html: '<p>Texto publicado propio</p>', excerpt: 'Resumen', date_created: '2026-10-27T12:00:00Z',
    date_modified: '2026-10-27T12:00:00Z', author_id: null, featured_image: null, source_key: 'PROVENANCE_MUST_STAY_PRIVATE' };
  const data = {
    [collections.articles]: scenario === 'empty' ? [] : [article, { ...article, id: 12, title: 'BORRADOR_PRIVADO_TC', slug: 'borrador-privado', status: 'draft' }],
    [collections.categories]: defaults.categories.map((item, index) => ({ id: index + 1, ...item })),
    [collections.authors]: [], [collections.media]: [], [collections.articleCategories]: [], [collections.pages]: [],
    [collections.navigation]: defaults.navigation.map((item, index) => ({ id: index + 1, ...item })),
  };
  const offset = Number(url.searchParams.get('offset') || 0);
  // Return only one record per page to exercise pagination under a server-side cap.
  const fields = url.searchParams.get('fields')?.split(',') || [];
  const page = (data[name] || []).slice(offset, offset + 1).map(item => Object.fromEntries(
    Object.entries(item).filter(([key]) => fields.includes(key))));
  res.end(JSON.stringify({ data: page }));
});

await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
const cmsPort = fixture.address().port;
async function freePort() {
  const socket = createServer();
  await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
  const port = socket.address().port;
  await new Promise(resolve => socket.close(resolve));
  return port;
}
async function withApp(scenario, check) {
  const port = await freePort();
  const root = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ['.next/standalone/server.js'], {
    windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'production', PORT: String(port), HOSTNAME: '127.0.0.1', DIRECTUS_URL: `http://127.0.0.1:${cmsPort}/${scenario}`,
      DIRECTUS_TOKEN: 'synthetic-runtime-token', CMS_PUBLIC_URL: `http://127.0.0.1:${cmsPort}`,
      SITE_URL: root, RESEND_API_KEY: '', DIRECTUS_SETUP_TOKEN: '', DIRECTUS_TRANSFER_TOKEN: '' },
  });
  let logs = '';
  child.stdout.on('data', value => { logs += value; });
  child.stderr.on('data', value => { logs += value; });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (child.exitCode !== null) throw new Error(`Next terminó: ${logs.slice(-1200)}`);
      try { if ((await fetch(`${root}/health`)).ok) { ready = true; break; } } catch { /* waiting for listener */ }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    assert.ok(ready, `Next no quedó listo: ${logs.slice(-1200)}`);
    await check(root);
  } finally {
    const exited = once(child, 'exit');
    child.kill();
    if (child.exitCode === null) await exited;
  }
}

try {
  await withApp('empty', async root => {
    const response = await fetch(root);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(html.includes(defaults.settings.empty_title));
    assert.ok(!html.includes('PUBLICACION_PROPIA_TC'));
    const sitemap = await (await fetch(`${root}/sitemap.xml`)).text();
    assert.ok(!sitemap.includes('/articulo/'));
    if (browserTests) {
      const ui = process.argv.includes('--ui');
      const runner = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test',
        ...(ui ? ['--ui'] : ['--reporter=dot', '--workers=2', '--global-timeout=90000'])], {
        windowsHide: true, stdio: 'inherit', env: { ...process.env, TC_E2E_URL: root },
      });
      const [code] = await once(runner, 'exit');
      assert.equal(code, 0, 'Fallaron las pruebas de navegador');
    }
  });
  console.log('OK: producción con cero artículos y sin respaldo heredado');
  await withApp('published', async root => {
    const html = await (await fetch(root)).text();
    assert.ok(html.includes('PUBLICACION_PROPIA_TC'));
    assert.ok(!html.includes('BORRADOR_PRIVADO_TC'));
    assert.ok(!html.includes('PROVENANCE_MUST_STAY_PRIVATE'));
    const draft = await (await fetch(`${root}/articulo/borrador-privado`)).text();
    assert.ok(!draft.includes('BORRADOR_PRIVADO_TC'));
    const sitemap = await (await fetch(`${root}/sitemap.xml`)).text();
    assert.ok(sitemap.includes('/articulo/publicacion-propia'));
    assert.ok(!sitemap.includes('/articulo/borrador-privado'));
    broken = true;
    assert.equal((await fetch(`${root}/health`)).status, 503);
  });
  console.log('OK: borradores y procedencia privados; CMS incompleto devuelve health 503');
  assert.ok(requests.every(req => req.resource === 'items' && req.name.startsWith('tc_')));
  const articleRequests = requests.filter(req => req.name === collections.articles);
  assert.ok(articleRequests.length > 0 && articleRequests.every(req => req.params.get('filter[status][_eq]') === 'publish'));
  console.log('OK: ninguna consulta a colecciones ajenas; filtro de publicación en el servidor');
} finally {
  fixture.closeAllConnections();
  await new Promise(resolve => fixture.close(resolve));
}
