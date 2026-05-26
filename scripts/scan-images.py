"""
Fase 1: Scanneo rápido de imágenes en WordPress
Solo verifica qué imágenes existen (HEAD request), sin descargar aún.
"""

import json
import os
import re
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent
BACKUP_JSON = BASE_DIR / 'src' / 'data' / 'backup.json'

# Cargar datos
with open(BACKUP_JSON, 'r', encoding='utf-8') as f:
    data = json.load(f)

articles = data.get('articles', [])

# Extraer URLs
IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

wp_images = set()
other_images = set()
total_with_imgs = 0

for article in articles:
    urls = IMG_RE.findall(article.get('content_html', '') or '')
    if urls:
        total_with_imgs += 1
    for url in urls:
        if 'turismocultural.com.ar' in url:
            wp_images.add(url)
        else:
            other_images.add(url)

print(f"📊 Artículos con imágenes: {total_with_imgs} de {len(articles)}")
print(f"🌐 Imágenes en WordPress:  {len(wp_images)}")
print(f"🔗 Imágenes externas:      {len(other_images)}")
print(f"📸 Total URLs únicas:      {len(wp_images) + len(other_images)}")

# Verificar dominio WP
print(f"\n🔍 Verificando acceso a turismocultural.com.ar...")
try:
    req = urllib.request.Request(
        'https://turismocultural.com.ar',
        headers={'User-Agent': 'Mozilla/5.0'},
        method='HEAD'
    )
    resp = urllib.request.urlopen(req, timeout=10)
    print(f"   ✅ WordPress accesible (HTTP {resp.status})")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Sample de URLs de WP
print(f"\n📋 Muestra de imágenes WP (primeras 10):")
for url in sorted(list(wp_images)[:10]):
    print(f"   {url}")
