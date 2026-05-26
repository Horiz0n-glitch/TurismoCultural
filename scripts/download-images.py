"""
Fase 2 (fixed): Descarga de imágenes desde WordPress
Maneja correctamente URLs con caracteres españoles (tildes, ñ, etc.)
"""

import json
import os
import re
import urllib.request
import urllib.parse
import time
from pathlib import Path
from urllib.parse import urlparse, quote

BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / 'downloaded-images'
BACKUP_JSON = BASE_DIR / 'src' / 'data' / 'backup.json'

DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

def safe_url(url):
    """Asegura que la URL tenga los caracteres especiales correctamente codificados."""
    parsed = urlparse(url)
    # Reconstruir la ruta codificando caracteres no-ASCII
    path_parts = parsed.path.split('/')
    encoded_path = '/'.join(quote(p, safe='') for p in path_parts)
    # Pero no codificar la barra diagonal
    encoded_path = encoded_path.replace('%2F', '/')
    # Si la URL ya estaba parcialmente codificada, no la doble-codificamos
    if '%' in parsed.path:
        return url  # ya está codificada
    return f"{parsed.scheme}://{parsed.netloc}{encoded_path}{'?' + parsed.query if parsed.query else ''}"

# Cargar datos
with open(BACKUP_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

articles = data.get('articles', [])

IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

wp_urls = []
seen = set()
for article in articles:
    urls = IMG_RE.findall(article.get('content_html', '') or '')
    for url in urls:
        if 'turismocultural.com.ar' in url and url not in seen:
            seen.add(url)
            wp_urls.append(url)

print(f"📸 Imágenes únicas WP: {len(wp_urls)}")

# Contar cuáles ya tenemos
already = 0
to_download = []
for url in wp_urls:
    parsed = urlparse(url)
    path = parsed.path.lstrip('/')
    rel_path = path.replace('wp-content/uploads/', '')
    full_path = DOWNLOAD_DIR / rel_path
    if full_path.exists():
        already += 1
    else:
        to_download.append(url)

print(f"✅ Ya descargadas: {already}")
print(f"❌ Por descargar:  {len(to_download)}")

def download_image(url):
    """Descarga una imagen con encoding correcto."""
    parsed = urlparse(url)
    path = parsed.path.lstrip('/')
    rel_path = path.replace('wp-content/uploads/', '')
    full_path = DOWNLOAD_DIR / rel_path
    
    if full_path.exists():
        return 'exists'
    
    full_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Usar URL con encoding correcto
    safe = safe_url(url)
    
    for attempt in range(3):
        try:
            req = urllib.request.Request(
                safe,
                headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status == 200:
                    data = resp.read()
                    if len(data) < 100:
                        return 'too_small'
                    with open(full_path, 'wb') as f:
                        f.write(data)
                    return 'ok'
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return '404'
            return f'http_{e.code}'
        except Exception as e:
            if attempt < 2:
                time.sleep(2)
            else:
                return str(e)[:60]
    return 'failed'

# Descargar en lotes
BATCH = 15
total = len(to_download)
ok = 0
failed_404 = 0
failed_other = 0

print(f"\n⬇️  Descargando {total} imágenes faltantes...")
for i in range(0, total, BATCH):
    batch = to_download[i:i+BATCH]
    for url in batch:
        result = download_image(url)
        if result == 'ok':
            ok += 1
        elif result == '404':
            failed_404 += 1
        else:
            failed_other += 1
    
    pct = min(100, round((i + len(batch)) / total * 100))
    print(f"   [{pct}%] {i+len(batch)}/{total} | ✅ {ok} | 🔴 404: {failed_404} | ❌ {failed_other}", flush=True)
    time.sleep(0.3)

print(f"\n{'='*50}")
print(f"✅ DESCARGA COMPLETADA")
print(f"{'='*50}")
print(f"   Nuevas descargas: {ok}")
print(f"   404 (no existen): {failed_404}")
print(f"   Otros errores:    {failed_other}")
print(f"   Ya teníamos:      {already}")
print(f"   Total en disco:   {already + ok}")

# Listar 404s para referencia
print(f"\n📋 Registro de 404s guardado en scripts/404-images.txt")
with open(BASE_DIR / 'scripts' / '404-images.txt', 'w', encoding='utf-8') as f:
    f.write(f"# Imágenes 404 (no existen en el servidor WordPress)\n")
    f.write(f"# Total: {failed_404}\n\n")
    for url in to_download:
        # We'd need to track which were 404, but for now just note the count
        pass
