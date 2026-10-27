#!/usr/bin/env node
import { createClient } from './directus/client.mjs';
import { transferArticle } from './directus/transfer.mjs';

const args = process.argv.slice(2);
const options = {};
try {
  while (args.length) {
    const flag = args.shift();
    if (flag === '--apply') { options.apply = true; continue; }
    const key = { '--source-id': 'sourceId', '--source-site': 'sourceSite', '--source-url': 'sourceUrl' }[flag];
    if (!key || !args.length || args[0].startsWith('--')) throw new Error('Opciones inválidas para enviar artículo.');
    options[key] = args.shift();
  }
  const api = createClient(process.env.DIRECTUS_URL, process.env.DIRECTUS_TRANSFER_TOKEN);
  const result = await transferArticle(api, { ...options, cmsUrl: process.env.DIRECTUS_URL });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
