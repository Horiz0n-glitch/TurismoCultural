"""Check articles that still have WP URLs in content_html."""
import os, json, re
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

# Check if articles have mixed URLs
cur.execute("""
  SELECT id, content_html LIKE '%turismocultural.com.ar%' AS has_wp,
         content_html LIKE '%.r2.cloudflarestorage.com%' AS has_r2
  FROM articles
  WHERE content_html LIKE '%turismocultural.com.ar%' 
     OR content_html LIKE '%.r2.cloudflarestorage.com%'
  LIMIT 5
""")
print("Sample article URL states:")
for art_id, wp, r2 in cur.fetchall():
    print(f"  Art #{art_id}: WP={wp} R2={r2}")

# Count articles that ONLY have WP URLs (still need update)
cur.execute("""
  SELECT COUNT(*) FROM articles 
  WHERE content_html LIKE '%turismocultural.com.ar%'
  AND content_html NOT LIKE '%.r2.cloudflarestorage.com%'
""")
need_update = cur.fetchone()[0]
print(f"\nArtículos que SOLO tienen WP (sin R2): {need_update}")

# Check a sample that still needs update
if need_update > 0:
    cur.execute("""
      SELECT id, SUBSTRING(content_html, 1, 400) FROM articles 
      WHERE content_html LIKE '%turismocultural.com.ar%'
      AND content_html NOT LIKE '%.r2.cloudflarestorage.com%'
      LIMIT 1
    """)
    art_id, html = cur.fetchone()
    # extract urls
    img_re = re.compile(r'https?://[^"\']+\.(?:jpg|jpeg|png|gif|webp|svg|ico)[^"\'>]*', re.I)
    urls = img_re.findall(html)
    print(f"\nArt #{art_id} sample URLs:")
    for u in urls[:5]:
        if 'turismocultural.com.ar' in u:
            print(f"  WP: {u[:90]}")
        else:
            print(f"  OTHER: {u[:90]}")

cur.close()
conn.close()
