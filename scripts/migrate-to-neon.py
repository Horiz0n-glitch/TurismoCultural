"""
Migración completa de datos de WordPress → Neon PostgreSQL

Uso:
  python scripts/migrate-to-neon.py "postgresql://..."

Este script:
  1. Crea las tablas (articles, categories, pages, media, users)
  2. Inserta todos los datos desde backup.json
  3. Extrae URLs de imágenes desde el HTML del contenido
  4. Genera un reporte de migración
"""

import sys
import json
import re
import os
from datetime import datetime

DB_URL = sys.argv[1] if len(sys.argv) > 1 else os.environ.get('DATABASE_URL')

if not DB_URL:
    print("ERROR: Proporcioná la URL de Neon como argumento o en DATABASE_URL")
    print("  python scripts/migrate-to-neon.py postgresql://...")
    sys.exit(1)

import psycopg2
from psycopg2.extras import execute_values

# ─── Cargar datos ───────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, 'src', 'data', 'backup.json')
MEDIA_PATH = os.path.join(BASE_DIR, 'src', 'data', 'media.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

with open(MEDIA_PATH, 'r', encoding='utf-8') as f:
    media_list = json.load(f)

articles = data.get('articles', [])
categories = data.get('categories', [])
pages = data.get('pages', [])
users = data.get('users', [])

print(f"📦 Datos cargados: {len(articles)} artículos, {len(categories)} categorías, {len(pages)} páginas, {len(media_list)} media, {len(users)} usuarios")

# ─── Conectar ───────────────────────────────────────────────────────
conn = psycopg2.connect(DB_URL, sslmode='require')
conn.autocommit = False
cur = conn.cursor()

print("🔌 Conectado a Neon PostgreSQL")

# ─── Crear tablas ───────────────────────────────────────────────────
print("🏗️  Creando tablas...")

cur.execute("""
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT DEFAULT '',
    count INTEGER DEFAULT 0,
    parent INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
""")

cur.execute("""
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
""")

cur.execute("""
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    content_html TEXT,
    excerpt TEXT,
    date_created TIMESTAMPTZ,
    date_created_gmt TIMESTAMPTZ,
    date_modified TIMESTAMPTZ,
    date_modified_gmt TIMESTAMPTZ,
    status TEXT DEFAULT 'publish',
    author_id INTEGER REFERENCES users(id),
    featured_media_id INTEGER,
    link TEXT,
    category_names TEXT[],
    categories_ids INTEGER[],
    image_urls TEXT[],
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
""")

cur.execute("""
  CREATE TABLE IF NOT EXISTS article_categories (
    article_id INTEGER REFERENCES articles(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, category_id)
  );
""")

cur.execute("""
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY,
    title TEXT,
    alt_text TEXT DEFAULT '',
    caption TEXT DEFAULT '',
    description TEXT DEFAULT '',
    filename TEXT,
    url TEXT DEFAULT '',
    cloudflare_url TEXT,
    date TIMESTAMPTZ,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    filesize INTEGER,
    post_id INTEGER,
    article_id INTEGER REFERENCES articles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
""")

cur.execute("""
  CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT,
    content_html TEXT,
    excerpt TEXT,
    date_created TIMESTAMPTZ,
    date_modified TIMESTAMPTZ,
    status TEXT DEFAULT 'publish',
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
""")

# ─── Indexes ────────────────────────────────────────────────────────
cur.execute("CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_articles_date ON articles(date_created DESC);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_media_article ON media(article_id);")
cur.execute("CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);")

print("✅ Tablas creadas")

# ─── Insertar usuarios ──────────────────────────────────────────────
if users:
    user_rows = [(u['id'], u.get('name', ''), u.get('slug', ''), u.get('email', ''), u.get('avatar_url', '')) for u in users]
    execute_values(cur,
        "INSERT INTO users (id, name, slug, email, avatar_url) VALUES %s ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name",
        user_rows
    )
    print(f"👤 {len(user_rows)} usuarios insertados")

# ─── Insertar categorías ────────────────────────────────────────────
cat_rows = []
for c in categories:
    slug = c.get('slug', '') or c['name'].lower().replace(' ', '-')
    cat_rows.append((c['id'], c['name'], slug, c.get('description', ''), c.get('count', 0), c.get('parent', 0)))

execute_values(cur,
    "INSERT INTO categories (id, name, slug, description, count, parent) VALUES %s ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, count=EXCLUDED.count",
    cat_rows
)
print(f"📂 {len(cat_rows)} categorías insertadas")

# ─── Extraer URLs de imágenes del HTML ──────────────────────────────
IMG_RE = re.compile(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', re.I)

def extract_image_urls(html):
    return list(set(IMG_RE.findall(html or '')))

# ─── Insertar artículos ─────────────────────────────────────────────
article_rows = []
article_cat_rows = []
image_urls_all = []
articles_with_images = 0

for a in articles:
    img_urls = extract_image_urls(a.get('content_html', ''))
    if img_urls:
        articles_with_images += 1
        image_urls_all.extend(img_urls)

    article_rows.append((
        a['id'], a.get('title', ''), a.get('slug', ''),
        a.get('content_html', ''), a.get('excerpt', ''),
        a.get('date_created'), a.get('date_created_gmt'),
        a.get('date_modified'), a.get('date_modified_gmt'),
        a.get('status', 'publish'),
        a.get('author_id'), a.get('featured_media_id'),
        a.get('link'),
        a.get('category_names', []),
        a.get('categories_ids', []),
        img_urls,
        None, None  # seo_title, seo_description
    ))

    # Article-Category relationships
    for cat_id in (a.get('categories_ids') or []):
        article_cat_rows.append((a['id'], cat_id))

# Batch insert articles
execute_values(cur,
    """INSERT INTO articles (id, title, slug, content_html, excerpt,
       date_created, date_created_gmt, date_modified, date_modified_gmt,
       status, author_id, featured_media_id, link,
       category_names, categories_ids, image_urls,
       seo_title, seo_description)
       VALUES %s ON CONFLICT (id) DO UPDATE SET
         title=EXCLUDED.title, content_html=EXCLUDED.content_html,
         status=EXCLUDED.status""",
    article_rows
)
print(f"📝 {len(article_rows)} artículos insertados ({articles_with_images} con imágenes)")

# Article-categories relationships
if article_cat_rows:
    execute_values(cur,
        "INSERT INTO article_categories (article_id, category_id) VALUES %s ON CONFLICT DO NOTHING",
        article_cat_rows
    )
    print(f"🔗 {len(article_cat_rows)} relaciones artículo-categoría")

# ─── Insertar media ─────────────────────────────────────────────────
media_rows = []
for m in media_list:
    media_rows.append((
        m['id'], m.get('title', ''), m.get('alt_text', ''),
        m.get('caption', ''), m.get('description', ''),
        m.get('filename', ''), m.get('url', ''),
        None,  # cloudflare_url
        m.get('date'), m.get('mime_type'),
        m.get('width'), m.get('height'),
        m.get('filesize'), m.get('post_id'),
        None  # article_id
    ))

execute_values(cur,
    """INSERT INTO media (id, title, alt_text, caption, description,
       filename, url, cloudflare_url, date, mime_type,
       width, height, filesize, post_id, article_id)
       VALUES %s ON CONFLICT (id) DO NOTHING""",
    media_rows
)
print(f"🖼️  {len(media_rows)} media insertados")

# ─── Insertar páginas ───────────────────────────────────────────────
page_rows = []
for p in pages:
    page_rows.append((
        p['id'], p.get('title', ''), p.get('slug', ''),
        p.get('content_html', ''), p.get('excerpt', ''),
        p.get('date_created'), p.get('date_modified'),
        p.get('status', 'publish'), p.get('link')
    ))

execute_values(cur,
    """INSERT INTO pages (id, title, slug, content_html, excerpt,
       date_created, date_modified, status, link)
       VALUES %s ON CONFLICT (id) DO UPDATE SET title=EXCLUDED.title""",
    page_rows
)
print(f"📄 {len(page_rows)} páginas insertadas")

# ─── Reporte final ──────────────────────────────────────────────────
cur.execute("SELECT COUNT(*) FROM articles")
total_articles = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM categories")
total_cats = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM media")
total_media = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM pages")
total_pages = cur.fetchone()[0]

# Stats on image URLs found in content
print(f"\n📊 IMÁGENES EXTRAÍDAS DEL CONTENIDO:")
print(f"   {len(image_urls_all)} URLs de imágenes encontradas en {articles_with_images} artículos")
print(f"   {len(set(image_urls_all))} URLs únicas")

# Unique domains
domains = set()
for url in image_urls_all:
    from urllib.parse import urlparse
    parsed = urlparse(url)
    if parsed.netloc:
        domains.add(parsed.netloc)
print(f"   Dominios: {', '.join(sorted(domains))}")

# ─── Commit ─────────────────────────────────────────────────────────
conn.commit()
cur.close()
conn.close()

print(f"\n{'='*50}")
print(f"✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
print(f"{'='*50}")
print(f"   Artículos:  {total_articles}")
print(f"   Categorías: {total_cats}")
print(f"   Media:      {total_media}")
print(f"   Páginas:    {total_pages}")
print(f"   Usuarios:   {len(users)}")
print(f"{'='*50}")
