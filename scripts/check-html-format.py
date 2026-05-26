"""Check actual stored HTML format in DB."""
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

import psycopg2
conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Get raw content sample
cur.execute("SELECT id, SUBSTRING(content_html, 1, 500) FROM articles WHERE content_html LIKE '%turismocultural.com.ar%' LIMIT 1")
art_id, html_sample = cur.fetchone()
print(f"Article #{art_id}")
print(f"HTML sample (first 500 chars):")
print(repr(html_sample[:300]))

# Also count articles with actual img tags
cur.execute("SELECT COUNT(*) FROM articles WHERE content_html LIKE '%<img%'")
with_img = cur.fetchone()[0]
print(f"\nArtículos con <img> literal: {with_img}")

# Articles with escaped img
cur.execute("SELECT COUNT(*) FROM articles WHERE content_html LIKE '%&lt;img%'")
escaped = cur.fetchone()[0]
print(f"Artículos con &lt;img&gt; (escapado): {escaped}")

cur.close()
conn.close()
