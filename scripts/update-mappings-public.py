"""Update url-mapping and r2-mapping with public URLs."""
import json, os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
PUBLIC_URL = 'https://pub-0a6f47d90d604a258a39345ef8280f5d.r2.dev'

# Update r2-mapping
with open(BASE_DIR / 'scripts' / 'r2-mapping.json') as f:
    r2 = json.load(f)

for item in r2:
    old_url = item['public_url']
    key = item['r2_key']
    item['public_url'] = f"{PUBLIC_URL}/{key}"

with open(BASE_DIR / 'scripts' / 'r2-mapping.json', 'w') as f:
    json.dump(r2, f, indent=2)

print(f"✅ r2-mapping.json: {len(r2)} URLs actualizadas")

# Update url-mapping
with open(BASE_DIR / 'scripts' / 'url-mapping.json') as f:
    url_map = json.load(f)

for item in url_map:
    old_url = item['r2_url']
    # Extract the key from the old URL
    if 'r2.cloudflarestorage.com' in old_url:
        key = '/'.join(old_url.split('/')[4:])  # skip protocol/account/bucket
    else:
        continue
    item['r2_url'] = f"{PUBLIC_URL}/{key}"

with open(BASE_DIR / 'scripts' / 'url-mapping.json', 'w') as f:
    json.dump(url_map, f, indent=2)

print(f"✅ url-mapping.json: {len(url_map)} entradas actualizadas")
print(f"🌐 {PUBLIC_URL}")
