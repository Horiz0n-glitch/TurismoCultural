"""Habilitar acceso público R2 y actualizar datos locales."""
import os, json, re, sys, urllib.request
from pathlib import Path
import boto3
from botocore.config import Config

BASE_DIR = Path(__file__).resolve().parent.parent

# Cargar .env
env_path = BASE_DIR / '.env'
with open(env_path) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ[k.strip()] = v.strip()

ACCOUNT_ID = os.environ.get('R2_ACCOUNT_ID')
ACCESS_KEY = os.environ.get('R2_ACCESS_KEY_ID')
SECRET_KEY = os.environ.get('R2_SECRET_ACCESS_KEY')
BUCKET = os.environ.get('R2_BUCKET', 'turismocultural')

if not all([ACCOUNT_ID, ACCESS_KEY, SECRET_KEY]):
    print("Missing R2 credentials in .env")
    sys.exit(1)

ENDPOINT = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"
PUBLIC_BASE = f"{ENDPOINT}/{BUCKET}"

s3 = boto3.client('s3',
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name='auto')

# Set bucket policy for public read
print("Setting public bucket policy...")
policy = {
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": "*",
        "Action": ["s3:GetObject"],
        "Resource": [f"arn:aws:s3:::{BUCKET}/*"]
    }]
}
try:
    s3.put_bucket_policy(Bucket=BUCKET, Policy=json.dumps(policy))
    print("Policy applied OK")
except Exception as e:
    print(f"Policy note: {e}")

# List all objects
objs = []
marker = ''
while True:
    resp = s3.list_objects_v2(Bucket=BUCKET, MaxKeys=1000)
    batch = resp.get('Contents', [])
    for obj in batch:
        objs.append(obj['Key'])
    if not resp.get('IsTruncated'):
        break
print(f"{len(objs)} objects in bucket")

# Test public access
test_url = f"{PUBLIC_BASE}/{objs[0]}"
print(f"Testing: {test_url[:80]}...")
try:
    req = urllib.request.Request(test_url, headers={'User-Agent': 'Mozilla/5.0'})
    resp = urllib.request.urlopen(req, timeout=10)
    print(f"HTTP {resp.status} - public access working!")
except Exception as e:
    print(f"Public access test failed: {e}")
    print("\nYou need to enable public access manually:")
    print("Cloudflare Dashboard -> R2 -> turismocultural -> Settings")
    print("-> Public Access -> Connect to r2.dev subdomain")
    print("Then share the pub-xxxxx.r2.dev URL with me")
    sys.exit(1)

# Update backup.json with R2 URLs
print("\nUpdating backup.json with R2 URLs...")
with open(BASE_DIR / 'src' / 'data' / 'backup.json', encoding='utf-8') as f:
    data = json.load(f)

r2_by_path = {}
for key in objs:
    r2_by_path[key] = f"{PUBLIC_BASE}/{key}"

IMGRE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)
replaced = 0

for article in data.get('articles', []):
    html = article.get('content_html', '') or ''
    if not html:
        continue
    urls = IMGRE.findall(html)
    new_html = html
    for url in urls:
        if 'turismocultural.com.ar' in url:
            path = url.split('/wp-content/uploads/')[-1] if '/wp-content/uploads/' in url else ''
            if path and path in r2_by_path:
                new_html = new_html.replace(url, r2_by_path[path])
                replaced += 1
    article['content_html'] = new_html

with open(BASE_DIR / 'src' / 'data' / 'backup.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print(f"{replaced} URLs replaced in backup.json")

# Update media.json
print("\nUpdating media.json...")
with open(BASE_DIR / 'src' / 'data' / 'media.json', encoding='utf-8') as f:
    media = json.load(f)

updated = 0
for item in media:
    for key in objs:
        fname = item.get('filename', '') or ''
        if fname and fname.lower() in key.lower():
            item['url'] = f"{PUBLIC_BASE}/{key}"
            updated += 1
            break

with open(BASE_DIR / 'src' / 'data' / 'media.json', 'w', encoding='utf-8') as f:
    json.dump(media, f, indent=2, ensure_ascii=False)
print(f"{updated} entries in media.json")

print("\nDone! Reload http://localhost:3000")
