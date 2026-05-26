"""Check current state of URLs in DB."""
import os, json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
env = (BASE_DIR / '.env').read_text()
db_url = ''
for line in env.split('\n'):
    if line.startswith('DATABASE_URL'):
        db_url = line.split('=', 1)[1]
        break

import psycopg2
conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute("SELECT COUNT(*) FROM articles WHERE content_html LIKE '%turismocultural.com.ar%'")
wp = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM articles WHERE content_html LIKE '%.r2.cloudflarestorage.com%'")
r2 = cur.fetchone()[0]
print(f"Content HTML -> WP: {wp} | R2: {r2}")

cur.execute("""
  SELECT COUNT(*) FROM articles 
  WHERE image_urls IS NOT NULL 
  AND array_to_string(image_urls, ',') LIKE '%turismocultural.com.ar%'
""")
wp2 = cur.fetchone()[0]
print(f"image_urls -> WP: {wp2}")

cur.execute("""
  SELECT COUNT(*) FROM articles 
  WHERE image_urls IS NOT NULL 
  AND array_to_string(image_urls, ',') LIKE '%.r2.cloudflarestorage.com%'
""")
r22 = cur.fetchone()[0]
print(f"image_urls -> R2: {r22}")

cur.execute("SELECT COUNT(*) FROM media WHERE cloudflare_url IS NOT NULL AND cloudflare_url != ''")
media_done = cur.fetchone()[0]
print(f"Media con cloudflare_url: {media_done}")

cur.close()
conn.close()
