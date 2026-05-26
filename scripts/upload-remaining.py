"""
Continue uploading remaining images to R2.
"""
import os, sys, mimetypes
from pathlib import Path
import boto3
from botocore.config import Config

BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / 'downloaded-images'

# Load .env
env_path = BASE_DIR / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip()

ACCOUNT = os.environ['R2_ACCOUNT_ID']
ACCESS = os.environ['R2_ACCESS_KEY_ID']
SECRET = os.environ['R2_SECRET_ACCESS_KEY']

s3 = boto3.client('s3',
    endpoint_url=f"https://{ACCOUNT}.r2.cloudflarestorage.com",
    aws_access_key_id=ACCESS,
    aws_secret_access_key=SECRET,
    config=Config(signature_version='s3v4'),
    region_name='auto')

# Check bucket
resp = s3.list_objects_v2(Bucket='turismocultural')
already_in_r2 = resp.get('KeyCount', 0)
print(f"📸 Imágenes ya en R2: {already_in_r2}")

# Find remaining
remaining = []
for root, dirs, files in os.walk(DOWNLOAD_DIR):
    for f in files:
        full_path = Path(root) / f
        rel = str(full_path.relative_to(DOWNLOAD_DIR)).replace(os.sep, '/')
        try:
            s3.head_object(Bucket='turismocultural', Key=rel)
        except:
            remaining.append((full_path, rel))

print(f"❌ Faltan subir: {len(remaining)}")

if not remaining:
    print("✅ Todas las imágenes ya están en R2")
    sys.exit(0)

# Upload remaining
ok = 0
fail = 0
for i, (file_path, r2_key) in enumerate(remaining):
    ct, _ = mimetypes.guess_type(str(file_path))
    if not ct:
        ct = 'application/octet-stream'
    if ct == 'image/jpg':
        ct = 'image/jpeg'
    try:
        with open(file_path, 'rb') as f:
            s3.put_object(
                Bucket='turismocultural',
                Key=r2_key,
                Body=f,
                ContentType=ct,
                CacheControl='public, max-age=31536000, immutable'
            )
        ok += 1
    except Exception as e:
        fail += 1
        print(f"  ❌ {r2_key[:60]}: {str(e)[:60]}")

    if (i+1) % 30 == 0 or i == len(remaining)-1:
        print(f"   [{i+1}/{len(remaining)}] ✅ {ok} | ❌ {fail}", flush=True)

# Final count
resp = s3.list_objects_v2(Bucket='turismocultural')
final = resp.get('KeyCount', 0)
print(f"\n✅ Total en R2: {final}")
