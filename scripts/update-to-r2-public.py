"""
Actualizar URLs locales a Cloudflare R2 público.
"""
import os, json, re, sys, urllib.request
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_URL = 'https://pub-0a6f47d90d604a258a39345ef8280f5d.r2.dev'

# ─── 1. List all R2 objects ─────────────────────────────────────────
env_path = BASE_DIR / '.env'
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip()

import boto3
from botocore.config import Config

s3 = boto3.client('s3',
    endpoint_url=f"https://{os.environ['R2_ACCOUNT_ID']}.r2.cloudflarestorage.com",
    aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
    aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
    config=Config(signature_version='s3v4'),
    region_name='auto')

objs = []
marker = ''
while True:
    resp = s3.list_objects_v2(Bucket='turismocultural', MaxKeys=1000)
    batch = resp.get('Contents', [])
    for obj in batch:
        objs.append(obj['Key'])
    if not resp.get('IsTruncated'):
        break

print(f"📸 {len(objs)} objetos en R2")

# Build lookup: path -> public URL
r2_map = {k: f"{PUBLIC_URL}/{k}" for k in objs}

# ─── 2. Update backup.json ──────────────────────────────────────────
print("\n📝 Actualizando backup.json...")
with open(BASE_DIR / 'src' / 'data' / 'backup.json', encoding='utf-8') as f:
    data = json.load(f)

IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)
replaced = 0
articles_updated = 0

for article in data.get('articles', []):
    html = article.get('content_html', '') or ''
    if not html:
        continue
    urls = IMG_RE.findall(html)
    new_html = html
    changed = False
    for url in urls:
        # Skip if already an R2 URL
        if 'r2.cloudflarestorage.com' in url or 'r2.dev' in url:
            continue
        # Map WordPress URL -> R2 public URL
        if 'turismocultural.com.ar' in url:
            path = url.split('/wp-content/uploads/')[-1] if '/wp-content/uploads/' in url else ''
            if path and path in r2_map:
                new_html = new_html.replace(url, r2_map[path])
                changed = True
                replaced += 1
    if changed:
        article['content_html'] = new_html
        articles_updated += 1

with open(BASE_DIR / 'src' / 'data' / 'backup.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"   ✅ {replaced} URLs reemplazadas en {articles_updated} artículos")

# ─── 3. Update media.json ───────────────────────────────────────────
print("\n🖼️  Actualizando media.json...")
with open(BASE_DIR / 'src' / 'data' / 'media.json', encoding='utf-8') as f:
    media = json.load(f)

updated_media = 0
for item in media:
    fname = item.get('filename', '') or ''
    if not fname:
        continue
    for key, r2_url in r2_map.items():
        if fname.lower() in key.lower():
            item['url'] = r2_url
            updated_media += 1
            break

with open(BASE_DIR / 'src' / 'data' / 'media.json', 'w', encoding='utf-8') as f:
    json.dump(media, f, indent=2, ensure_ascii=False)

print(f"   ✅ {updated_media} entries actualizadas en media.json")

# ─── 4. Verify ──────────────────────────────────────────────────────
print("\n🔍 Verificando...")
test_url = f"{PUBLIC_URL}/2018/01/LA-TROCHITA-3-1-1-1.jpg"
try:
    req = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=10)
    print(f"   ✅ Pública: {resp.status}")
except Exception as e:
    print(f"   ❌ {e}")

print(f"\n{'='*50}")
print(f"✅ TODO LISTO")
print(f"{'='*50}")
print(f"   backup.json: {replaced} URLs -> R2")
print(f"   media.json:  {updated_media} entries -> R2")
print(f"   🌐 {PUBLIC_URL}")
print(f"\n🏠 Recargá http://localhost:3000")
