/**
 * Regenera src/data/media.json poblando el campo `url` desde articles.content_html.
 *
 * Estrategia: para cada artículo, extraer la primera URL de imagen de content_html
 * (que ya fue migrada a R2) y asociarla a su featured_media_id.
 *
 * Solo modifica el campo `url`; preserva el resto del objeto.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const backupPath = path.join(root, 'src', 'data', 'backup.json');
const mediaPath = path.join(root, 'src', 'data', 'media.json');

const backup = JSON.parse(readFileSync(backupPath, 'utf-8').replace(/^\uFEFF/, ''));
const media = JSON.parse(readFileSync(mediaPath, 'utf-8').replace(/^\uFEFF/, ''));

const IMG_RE = /<img[^>]+src=["'](https?:\/\/[^"']+)["']/i;

const mediaUrlById = new Map();
for (const article of backup.articles) {
  if (!article.featured_media_id || !article.content_html) continue;
  const match = article.content_html.match(IMG_RE);
  if (match && !mediaUrlById.has(article.featured_media_id)) {
    mediaUrlById.set(article.featured_media_id, match[1]);
  }
}

let matched = 0;
let skipped = 0;
for (const m of media) {
  const url = mediaUrlById.get(m.id);
  if (url) {
    m.url = url;
    matched++;
  } else {
    skipped++;
  }
}

writeFileSync(mediaPath, JSON.stringify(media, null, 2) + '\n', 'utf-8');
console.log(`OK: ${matched} URLs pobladas, ${skipped} sin match (de ${media.length} items)`);