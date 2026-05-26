"""Generate the image mapping file for R2 upload."""
import json, re
from pathlib import Path
from urllib.parse import urlparse

BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / 'downloaded-images'
MAPPING_FILE = BASE_DIR / 'scripts' / 'image-mapping.json'

with open(BASE_DIR / 'src' / 'data' / 'backup.json', encoding='utf-8') as f:
    data = json.load(f)

# Build mapping: local path -> original URL -> article info
IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

mapping = []
seen_urls = set()

for article in data.get('articles', []):
    urls = IMG_RE.findall(article.get('content_html', '') or '')
    for url in urls:
        if url in seen_urls:
            continue
        seen_urls.add(url)
        
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path.lstrip('/')
        rel_path = path.replace('wp-content/uploads/', '')
        local_path = DOWNLOAD_DIR / rel_path
        
        entry = {
            'original_url': url,
            'domain': domain,
            'local_path': str(local_path.relative_to(BASE_DIR)) if local_path.exists() else None,
            'downloaded': local_path.exists(),
            'r2_key': rel_path.replace('\\', '/') if 'turismocultural.com.ar' in url else f'external/{domain}/{rel_path.split("/")[-1]}',
            'source_articles': [{'id': article['id'], 'title': article.get('title','')[:60]}],
        }
        mapping.append(entry)

with open(MAPPING_FILE, 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)

downloaded = sum(1 for m in mapping if m['downloaded'])
print(f"📋 Mapping generado: {MAPPING_FILE}")
print(f"   Total URLs: {len(mapping)}")
print(f"   Descargadas: {downloaded}")
print(f"   WordPress: {sum(1 for m in mapping if 'turismocultural.com.ar' in m['original_url'])}")
print(f"   Externas: {sum(1 for m in mapping if 'turismocultural.com.ar' not in m['original_url'])}")
