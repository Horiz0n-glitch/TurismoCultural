This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Directus y Dokploy

El despliegue usa Docker Compose con tres servicios privados en la red de Dokploy: Next.js, Directus y PostgreSQL. Las bases y cargas de Directus quedan en volúmenes persistentes. Sólo se publican el puerto 3000 del sitio y el 8055 del CMS mediante los dominios de Dokploy.

1. En Dokploy crea una aplicación Compose desde este repositorio y agrega los secretos `POSTGRES_PASSWORD`, `DIRECTUS_SECRET`, `DIRECTUS_ADMIN_EMAIL` y `DIRECTUS_ADMIN_PASSWORD`. No guardes valores reales en Git.
2. Configura `SITE_URL=https://site-181-215-134-40.sslip.io` y `CMS_PUBLIC_URL=https://cms-181-215-134-40.sslip.io`. En Dokploy asigna el dominio del sitio al servicio `web` en el puerto 3000 y el dominio del CMS al servicio `directus` en el puerto 8055; activa HTTPS para ambos antes de iniciar sesión.
3. Despliega la composición. El sitio responderá sin contenido hasta terminar la inicialización de Directus.
4. Desde una terminal segura ejecuta `npm run directus:bootstrap` con `DIRECTUS_URL`, `DIRECTUS_ADMIN_EMAIL` y `DIRECTUS_ADMIN_PASSWORD` disponibles como variables del proceso. El comando crea las colecciones y carga las 551 noticias, 59 categorías y los metadatos disponibles en el respaldo JSON. No escribas contraseñas en comandos guardados ni en archivos versionados.
5. En Directus crea un usuario API con una política de sólo lectura para `articles`, `categories`, `authors`, `media`, `articles_categories`, `pages`, `site_settings` y `navigation_items`. Limita `articles` y `pages` a `status = publish` y concede sólo los campos que consume el sitio. Guarda su token estático en Dokploy como `DIRECTUS_TOKEN` y vuelve a desplegar `web`.
6. Para servir imágenes cargadas en Directus, activa en la política Public lectura de `directus_files` con los campos públicos necesarios. El sitio no guarda material privado en esa colección. Tras la importación inicial, actualiza las secuencias PostgreSQL desde el directorio del proyecto con `Get-Content scripts/reset-directus-sequences.sql | docker compose exec -T db psql -U directus -d directus` para que los siguientes registros nuevos reciban IDs disponibles.

El adaptador del sitio consulta Directus en tiempo de petición y actualiza su caché cada 60 segundos. Los artículos, páginas, categorías, navegación, portada, contacto y metadatos generales se editan en el CMS. Las 35 páginas heredadas se importan como borrador para revisión. Las imágenes nuevas se cargan en Directus; los enlaces de imágenes heredados siguen apuntando a sus URLs existentes. El respaldo tiene 926 registros de medios sin URL, que no pueden reconstruirse desde este repositorio.

Para cambiar los dominios temporales, actualiza `SITE_URL` y `CMS_PUBLIC_URL` en Dokploy y las rutas de dominio asociadas a `web` y `directus`. Mantén PostgreSQL sin puerto público y configura copias periódicas de los volúmenes `postgres_data` y `directus_uploads`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
