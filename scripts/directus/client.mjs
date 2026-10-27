export function createClient(baseUrl, token, fetcher = fetch) {
  if (!baseUrl || !token) throw new Error('Faltan DIRECTUS_URL y el token específico de esta operación.');
  const base = new URL(baseUrl);
  if (base.username || base.password || base.search || base.hash || !['https:', 'http:'].includes(base.protocol)) {
    throw new Error('DIRECTUS_URL no puede contener credenciales, consulta ni fragmento.');
  }
  if (base.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)) {
    throw new Error('Usar HTTPS para enviar el token a Directus.');
  }
  const root = base.href.replace(/\/+$/, '');
  return async function api(path, method = 'GET', body) {
    const response = await fetcher(`${root}${path}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${token}`, ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    // Error messages never expose request headers or private response bodies.
    if (!response.ok) throw new Error(`${method} ${path.split('?')[0]}: HTTP ${response.status}`);
    return (await response.json()).data;
  };
}
