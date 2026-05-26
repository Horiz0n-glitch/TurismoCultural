"""
Generar mapping: URL original WordPress → URL Cloudflare R2
Y actualizar DB de Neon con las nuevas URLs.
"""
import os, json, re, sys
from pathlib import Path
from urllib.parse import urlparse
import boto3
from botocore.config import Config

BASE_DIR = Path(__file__).resolve().parent.parent

# ─── Cargar .env ────────────────────────────────────────────────────
env_path = BASE_DIR / '.env'
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip()

# ─── Cargar R2 mapping ──────────────────────────────────────────────
with open(BASE_DIR / 'scripts' / 'r2-mapping.json') as f:
    r2_objects = json.load(f)

# Build lookup: filename -> r2_url (for matching)
r2_by_filename = {}
for obj in r2_objects:
    key = obj['r2_key']
    filename = key.split('/')[-1].lower()
    r2_by_filename[filename] = obj['public_url']

print(f"📸 {len(r2_objects)} imágenes en R2")

# ─── Cargar backup.json para mapping original ──────────────────────
with open(BASE_DIR / 'src' / 'data' / 'backup.json', encoding='utf-8') as f:
    data = json.load(f)

# Build mapping: original WP URL -> R2 URL
# We know the download structure preserved: YEAR/MONTH/filename
# R2 key is exactly that path
IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

url_mapping = {}  # original_url -> r2_url
r2_urls_by_path = {obj['r2_key']: obj['public_url'] for obj in r2_objects}

for article in data.get('articles', []):
    urls = IMG_RE.findall(article.get('content_html', '') or '')
    for url in urls:
        if url in url_mapping:
            continue
        if 'turismocultural.com.ar' in url:
            parsed = urlparse(url)
            path = parsed.path.lstrip('/')
            rel_path = path.replace('wp-content/uploads/', '')
            if rel_path in r2_urls_by_path:
                url_mapping[url] = r2_urls_by_path[rel_path]
        else:
            # External image, no R2 mapping
            pass

print(f"🔗 URLs mapeadas: {len(url_mapping)} de {len(r2_objects)} en R2")

# Some might have slightly different paths (e.g., -scaled suffix, size variants)
# Check unmapped
unmapped = 0
for obj in r2_objects:
    key = obj['r2_key']
    found = False
    for orig_url in url_mapping:
        if key in orig_url or key.split('/')[-1] in orig_url:
            found = True
            break
    if not found:
        unmapped += 1

print(f"⚠️  Sin mapeo directo: {unmapped}")

# ─── Guardar mapping ────────────────────────────────────────────────
output = []
for orig, r2 in sorted(url_mapping.items()):
    output.append({'original_url': orig, 'r2_url': r2})

with open(BASE_DIR / 'scripts' / 'url-mapping.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"\n📋 URL mapping guardado: scripts/url-mapping.json")
print(f"   Ejemplo:")
if output:
    print(f"     Original: {output[0]['original_url'][:80]}")
    print(f"     R2:       {output[0]['r2_url'][:80]}")
