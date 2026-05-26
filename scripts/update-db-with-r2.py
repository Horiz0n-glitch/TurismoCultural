"""
Fase 1: Actualizar media.cloudflare_url y article.image_urls en Neon.
"""
import os, json, sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Leer .env
env = (BASE_DIR / '.env').read_text()
db_url = ''
for line in env.split('\n'):
    line = line.strip()
    if line.startswith('DATABASE_URL'):
        db_url = line.split('=', 1)[1]

import psycopg2

# Cargar mappings
with open(BASE_DIR / 'scripts' / 'url-mapping.json') as f:
    url_map = json.load(f)
with open(BASE_DIR / 'scripts' / 'r2-mapping.json') as f:
    r2_objects = json.load(f)

orig_to_r2 = {item['original_url']: item['r2_url'] for item in url_map}

conn = psycopg2.connect(db_url)
cur = conn.cursor()

# ─── 1. Media ───────────────────────────────────────────────────────
cur.execute("SELECT COUNT(*) FROM media WHERE (cloudflare_url IS NULL OR cloudflare_url = '') AND url != ''")
total_media = cur.fetchone()[0]
print(f"🖼️  Media sin cloudflare_url: {total_media}")

updated_media = 0
cur.execute("SELECT id, url FROM media WHERE (cloudflare_url IS NULL OR cloudflare_url = '') AND url != ''")
for media_id, media_url in cur.fetchall():
    filename = media_url.split('/')[-1].lower()
    for r2 in r2_objects:
        if r2['r2_key'].endswith(filename):
            cur.execute("UPDATE media SET cloudflare_url = %s WHERE id = %s",
                       (r2['public_url'], media_id))
            updated_media += 1
            break

print(f"✅ Media actualizadas: {updated_media}")

# ─── 2. Article image_urls ──────────────────────────────────────────
cur.execute("SELECT COUNT(*) FROM articles WHERE image_urls IS NOT NULL")
total_arts = cur.fetchone()[0]
print(f"\n📝 Artículos con image_urls: {total_arts}")

updated_arts = 0
cur.execute("SELECT id, image_urls FROM articles WHERE image_urls IS NOT NULL")
for art_id, img_urls in cur.fetchall():
    if not img_urls:
        continue
    new_urls = [orig_to_r2.get(u, u) for u in img_urls]
    if new_urls != img_urls:
        cur.execute("UPDATE articles SET image_urls = %s WHERE id = %s", (new_urls, art_id))
        updated_arts += 1

print(f"✅ Artículos image_urls actualizados: {updated_arts}")

# ─── 3. Content HTML (batching para evitar timeout) ─────────────────
cur.execute("SELECT COUNT(*) FROM articles WHERE content_html LIKE '%%turismocultural.com.ar%%'")
total_html = cur.fetchone()[0]
print(f"\n📄 Artículos con URLs WP en HTML: {total_html}")

batch_size = 50
updated_html = 0
offset = 0

while offset < total_html:
    cur.execute(
        "SELECT id, content_html FROM articles WHERE content_html LIKE '%%turismocultural.com.ar%%' ORDER BY id LIMIT %s OFFSET %s",
        (batch_size, offset)
    )
    rows = cur.fetchall()
    if not rows:
        break
    
    for art_id, html in rows:
        if not html:
            continue
        new_html = html
        for orig, r2 in orig_to_r2.items():
            new_html = new_html.replace(orig, r2)
        if new_html != html:
            cur.execute("UPDATE articles SET content_html = %s WHERE id = %s", (new_html, art_id))
            updated_html += 1
    
    conn.commit()
    offset += batch_size
    print(f"   Progreso: {min(offset, total_html)}/{total_html} | HTML actualizados: {updated_html}", flush=True)

print(f"\n✅ Content HTML actualizados: {updated_html}")

conn.commit()
cur.close()
conn.close()

print(f"\n{'='*50}")
print(f"✅ DB ACTUALIZADA")
print(f"{'='*50}")
print(f"   Media URLs:     {updated_media}")
print(f"   Article URLs:   {updated_arts}")
print(f"   Content HTML:   {updated_html}")
