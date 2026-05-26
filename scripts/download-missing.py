"""
Descarga rápida de imágenes faltantes con encoding correcto.
Solo descarga las que faltan (no las que ya tenemos).
"""

import json
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
    parsed = urlparse(url)
    if '%' in parsed.path:
        return url
    path_parts = parsed.path.split('/')
    encoded_path = '/'.join(quote(p, safe='') for p in path_parts)
    encoded_path = encoded_path.replace('%2F', '/')
    return f"{parsed.scheme}://{parsed.netloc}{encoded_path}"

# Cargar
with open(BACKUP_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

all_urls = set()
for a in data.get('articles', []):
    for u in IMG_RE.findall(a.get('content_html','') or ''):
        if 'turismocultural.com.ar' in u:
            all_urls.add(u)

wp_urls = sorted(all_urls)

# Cuáles faltan
missing = []
for url in wp_urls:
    parsed = urlparse(url)
    path = parsed.path.lstrip('/')
    rel_path = path.replace('wp-content/uploads/', '')
    if not (DOWNLOAD_DIR / rel_path).exists():
        missing.append(url)

print(f"📸 Total WP: {len(wp_urls)}")
print(f"✅ En disco: {len(wp_urls) - len(missing)}")
print(f"❌ Faltan:   {len(missing)}")

# Descargar
ok = 0
f404 = 0
fail = 0
total = len(missing)

for i, url in enumerate(missing):
    parsed = urlparse(url)
    path = parsed.path.lstrip('/')
    rel_path = path.replace('wp-content/uploads/', '')
    full_path = DOWNLOAD_DIR / rel_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    
    safe = safe_url(url)
    
    try:
        req = urllib.request.Request(safe, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            img_data = resp.read()
            if len(img_data) < 200:
                f404 += 1
                print(f"   🔴 {rel_path[:60]}")
            else:
                with open(full_path, 'wb') as f:
                    f.write(img_data)
                ok += 1
    except urllib.error.HTTPError as e:
        f404 += 1
    except Exception as e:
        fail += 1
        print(f"   ⚠️  {rel_path[:50]}: {str(e)[:60]}")
    
    if (i+1) % 20 == 0 or i == total - 1:
        print(f"[{i+1}/{total}] ✅ {ok} | 🔴 404: {f404} | ❌ {fail}", flush=True)
    time.sleep(0.2)

# Resumen final
total_files = sum(1 for _ in Path(DOWNLOAD_DIR).rglob('*') if _.is_file())
print(f"\n{'='*50}")
print(f"✅ TOTAL EN DISCO: {total_files} imágenes")
print(f"{'='*50}")
print(f"   Descargadas ahora: {ok}")
print(f"   404 (no existen):  {f404}")
print(f"   Errores:           {fail}")
