"""Check why content_html replacement isn't matching."""
import os, json, re, sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

env = (BASE_DIR / '.env').read_text()
db_url = ''
for line in env.split('\n'):
    line = line.strip()
    if line.startswith('DATABASE_URL'):
        db_url = line.split('=', 1)[1]
        break

with open(BASE_DIR / 'scripts' / 'url-mapping.json') as f:
    url_map = json.load(f)
orig_to_r2 = {item['original_url']: item['r2_url'] for item in url_map}

import psycopg2
conn = psycopg2.connect(db_url)
cur = conn.cursor()

IMGRE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

# Sample articles
cur.execute("SELECT id, content_html FROM articles WHERE content_html LIKE '%turismocultural.com.ar%' LIMIT 3")
for art_id, html in cur.fetchall():
    urls = IMGRE.findall(html)
    print(f"\nArt #{art_id}: {len(urls)} img tags")
    for u in urls[:5]:
        if 'turismocultural.com.ar' in u:
            matched = u in orig_to_r2
            print(f"  {'OK' if matched else 'MISS'} {u[:90]}")
            if not matched:
                # check by filename
                fname = u.split('/')[-1].split('?')[0].lower()
                for k in orig_to_r2:
                    if k.endswith(fname):
                        print(f"     -> fuzzy: {k[:80]}")
                        break

cur.close()
conn.close()
