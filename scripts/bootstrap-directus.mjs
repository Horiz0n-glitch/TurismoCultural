#!/usr/bin/env node
// Preview by default. --apply adds only the Turismo Cultural namespace.
import { pathToFileURL } from 'node:url';
import { createClient } from './directus/client.mjs';
import { provision, describePlan } from './directus/schema.mjs';

export async function main(args = process.argv.slice(2)) {
  if (args.some(arg => !['--plan', '--apply'].includes(arg)) || (args.includes('--apply') && args.includes('--plan'))) {
    throw new Error('Uso: npm run directus:bootstrap -- [--plan | --apply]');
  }
  console.log(JSON.stringify(describePlan(), null, 2));
  if (!args.includes('--apply')) return;
  const api = createClient(process.env.DIRECTUS_URL, process.env.DIRECTUS_SETUP_TOKEN);
  console.log(JSON.stringify(await provision(api), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
