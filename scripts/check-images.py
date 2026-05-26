"""
Verificar estado de las descargas de imágenes.
"""

import json
import os
import re
from pathlib import Path
from urllib.parse import urlparse
import urllib.request
import time

BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / 'downloaded-images'
BACKUP_JSON = BASE_DIR / 'src' / 'data' / 'backup.json'

with open(BACKUP_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

articles = data.get('articles', [])

IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

wp_urls = set()
for article in articles:
    urls = IMG_RE.findall(article.get('content_html', '') or '')
    for url in urls:
        if 'turismocultural.com.ar' in url:
            wp_urls.add(url)

wp_urls = sorted(wp_urls)

print(f"📸 Total imágenes WP: {len(wp_urls)}")

# Contar cuáles ya tenemos descargadas
downloaded = 0
missing = []
for url in wp_urls:
    parsed = urlparse(url)
    path = parsed.path.lstrip('/')
    rel_path = path.replace('wp-content/uploads/', '')
    full_path = DOWNLOAD_DIR / rel_path
    if full_path.exists():
        downloaded += 1
    else:
        missing.append(url)

print(f"✅ Descargadas: {downloaded}")
print(f"❌ Faltantes:   {len(missing)}")

# Verificar las primeras 30 faltantes
print(f"\n🔍 Verificando primeras 30 imágenes faltantes...")
still_available = 0
not_found = 0
other_fail = 0

for url in missing[:30]:
    try:
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0'},
            method='HEAD'
        )
        resp = urllib.request.urlopen(req, timeout=15)
        if resp.status == 200:
            still_available += 1
            print(f"   ✅ {url[:80]}")
        else:
            not_found += 1
            print(f"   ❌ HTTP {resp.status}: {url[:80]}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            not_found += 1
            print(f"   🔴 404: {url[:80]}")
        else:
            other_fail += 1
            print(f"   ⚠️  HTTP {e.code}: {url[:80]}")
    except Exception as e:
        other_fail += 1
        print(f"   ⚠️  Error: {str(e)[:50]} - {url[:80]}")
    time.sleep(0.3)

print(f"\n📊 De {len(missing[:30])} verificadas:")
print(f"   Disponibles: {still_available}")
print(f"   404:         {not_found}")
print(f"   Otros error: {other_fail}")
