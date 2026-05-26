"""Download last few missing images from WordPress."""
import json, re, urllib.request, time
from pathlib import Path
from urllib.parse import urlparse, quote

BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / 'downloaded-images'

def safe_url(url):
    parsed = urlparse(url)
    if '%' in parsed.path:
        return url
    path_parts = parsed.path.split('/')
    encoded_path = '/'.join(quote(p, safe='') for p in path_parts).replace('%2F', '/')
    return f'{parsed.scheme}://{parsed.netloc}{encoded_path}'

with open(BASE_DIR / 'src' / 'data' / 'backup.json', encoding='utf-8') as f:
    data = json.load(f)

IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

all_urls = set()
for a in data.get('articles', []):
    for u in IMG_RE.findall(a.get('content_html','') or ''):
        if 'turismocultural.com.ar' in u:
            all_urls.add(u)

missing = []
for url in sorted(all_urls):
    parsed = urlparse(url)
    rel_path = parsed.path.lstrip('/').replace('wp-content/uploads/', '')
    if not (DOWNLOAD_DIR / rel_path).exists():
        missing.append(url)

print(f'Faltan {len(missing)} imagenes:')
for url in missing:
    parsed = urlparse(url)
    rel_path = parsed.path.lstrip('/').replace('wp-content/uploads/', '')
    full_path = DOWNLOAD_DIR / rel_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    safe = safe_url(url)
    try:
        req = urllib.request.Request(safe, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            img_data = resp.read()
            if len(img_data) > 200:
                with open(full_path, 'wb') as f:
                    f.write(img_data)
                print(f'  ✅ {rel_path[:70]}')
            else:
                print(f'  🔴 too small: {rel_path[:70]}')
    except Exception as e:
        print(f'  ❌ {rel_path[:60]}: {str(e)[:50]}')
    time.sleep(0.5)

total = sum(1 for _ in Path(DOWNLOAD_DIR).rglob('*') if _.is_file())
print(f'\nTotal en disco: {total}')
