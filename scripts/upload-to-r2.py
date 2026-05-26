"""
Subir imágenes descargadas a Cloudflare R2
Uso: python scripts/upload-to-r2.py
"""

import json, os, sys, mimetypes
from pathlib import Path
import boto3
from botocore.config import Config

BASE_DIR = Path(__file__).resolve().parent.parent
DOWNLOAD_DIR = BASE_DIR / 'downloaded-images'

# ─── Cargar .env manualmente ───────────────────────────────────────
env_path = BASE_DIR / '.env'
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip()

ACCOUNT_ID = os.environ.get('R2_ACCOUNT_ID')
ACCESS_KEY = os.environ.get('R2_ACCESS_KEY_ID')
SECRET_KEY = os.environ.get('R2_SECRET_ACCESS_KEY')
BUCKET = os.environ.get('R2_BUCKET_NAME', 'turismocultural')

if not all([ACCOUNT_ID, ACCESS_KEY, SECRET_KEY]):
    print("❌ Faltan credenciales R2 en .env")
    print("   Necesito: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY")
    sys.exit(1)

print(f"🔌 Conectando a R2 (account: {ACCOUNT_ID[:12]}..., bucket: {BUCKET})...")

ENDPOINT = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"
s3 = boto3.client(
    's3',
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    config=Config(signature_version='s3v4'),
    region_name='auto',
)

# Verificar bucket
try:
    s3.head_bucket(Bucket=BUCKET)
    print(f"✅ Bucket '{BUCKET}' accesible")
except Exception as e:
    try:
        s3.create_bucket(Bucket=BUCKET)
        print(f"🆕 Bucket '{BUCKET}' creado")
    except Exception as e2:
        print(f"❌ Error con bucket: {e2}")
        sys.exit(1)

# ─── Escanear imágenes ─────────────────────────────────────────────
print(f"\n🔍 Escaneando {DOWNLOAD_DIR}...")
image_files = []
for root, dirs, files in os.walk(DOWNLOAD_DIR):
    for f in files:
        full_path = Path(root) / f
        rel_path = full_path.relative_to(DOWNLOAD_DIR)
        image_files.append((full_path, str(rel_path).replace('\\', '/')))

print(f"📸 {len(image_files)} imágenes para subir")

# ─── Subir a R2 ─────────────────────────────────────────────────────
uploaded = 0
skipped = 0
failed = 0

for i, (file_path, r2_key) in enumerate(image_files):
    content_type, _ = mimetypes.guess_type(str(file_path))
    if not content_type:
        content_type = 'application/octet-stream'
    if content_type == 'image/jpg':
        content_type = 'image/jpeg'
    
    try:
        s3.head_object(Bucket=BUCKET, Key=r2_key)
        skipped += 1
    except:
        with open(file_path, 'rb') as f:
            s3.put_object(
                Bucket=BUCKET,
                Key=r2_key,
                Body=f,
                ContentType=content_type,
                CacheControl='public, max-age=31536000, immutable',
            )
        uploaded += 1
    
    if (i + 1) % 100 == 0:
        pct = round((i+1)/len(image_files)*100)
        print(f"   [{pct}%] {i+1}/{len(image_files)} | ✅ {uploaded} | ⏭️ {skipped} | ❌ {failed}", flush=True)

# ─── Mapping de URLs públicas ───────────────────────────────────────
# La URL pública de R2 sigue el patrón:
# https://pub-SOMETHING.r2.dev/ (si está configurado como público)
# O usamos el endpoint directo
public_base = f"{ENDPOINT}/{BUCKET}"

mapping = []
for file_path, r2_key in image_files:
    mapping.append({
        'r2_key': r2_key,
        'public_url': f"{public_base}/{r2_key}",
    })

with open(BASE_DIR / 'scripts' / 'r2-mapping.json', 'w', encoding='utf-8') as f:
    json.dump(mapping, f, indent=2, ensure_ascii=False)

print(f"\n{'='*50}")
print(f"✅ SUBIDA A R2 COMPLETADA")
print(f"{'='*50}")
print(f"   Subidas:   {uploaded}")
print(f"   Ya existían: {skipped}")
print(f"   Fallidas:  {failed}")
print(f"   Total:     {len(image_files)}")
print(f"\n   📋 Mapping: scripts/r2-mapping.json")
print(f"   🖼️  Ejemplo: {public_base}/{image_files[0][1] if image_files else 'N/A'}")
