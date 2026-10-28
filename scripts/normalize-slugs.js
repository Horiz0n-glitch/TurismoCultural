import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupPath = path.join(__dirname, '..', 'src', 'data', 'backup.json');

const data = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const numericSlugPattern = /^\d+(-\d+)?$/;
let changed = 0;
const slugMap = {};

for (const article of data.articles) {
  if (numericSlugPattern.test(article.slug)) {
    const title = article.title?.trim();
    const newSlug = title ? slugify(title) : `articulo-${article.id}`;
    slugMap[article.slug] = newSlug;
    article.slug = newSlug;
    changed++;
  }
}

fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf-8');

console.log(`Normalized ${changed} slugs:`);
for (const [old, slug] of Object.entries(slugMap)) {
  console.log(`  ${old} -> ${slug}`);
}
