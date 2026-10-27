# Turismo Cultural

Portal editorial Next.js 16.2.6. Se despliega como un único servicio web en Dokploy y utiliza el Directus compartido en `https://adminhabitat.horizontsoftware.com.ar`.

## Contenido propio desde cero

La web consulta exclusivamente las colecciones `tc_*` definidas en `src/config/directus-collections.json`. No consulta `articulos`, `categorias` ni ninguna colección de otros sitios. El respaldo histórico se conserva como archivo del proyecto y no se importa ni se utiliza como contenido de desarrollo o producción.

En Directus las colecciones nuevas se agrupan bajo **Turismo Cultural**:

| Colección | Uso |
| --- | --- |
| `tc_articles` | Artículos propios y copias recibidas, borrador por defecto |
| `tc_categories` / `tc_articles_categories` | Categorías propias; se asignan desde cada artículo |
| `tc_authors` | Autores propios |
| `tc_media` | URLs de medios externos opcionales |
| `tc_pages` | Páginas institucionales |
| `tc_site_settings` | Configuración única: portada, textos, redes, contacto y estado vacío |
| `tc_navigation_items` | Menús y enlaces del pie |

La inicialización crea tres categorías, el menú inicial, la configuración y Quiénes Somos. Crea **cero artículos**, autores o medios. El sitio muestra un estado vacío editable hasta que se publique el primer artículo. Los borradores se excluyen en la consulta al CMS y también en el adaptador.

## Preparación del CMS compartido

`npm run directus:bootstrap` muestra un plan local y no hace solicitudes de red ni cambios. Para aplicar la inicialización se necesita un respaldo reciente de la base del CMS y un token administrativo configurado sólo en el proceso de preparación como `DIRECTUS_SETUP_TOKEN`, junto con `DIRECTUS_URL`. No se incluyen valores reales en este repositorio.

```powershell
npm run directus:bootstrap -- --plan
npm run directus:bootstrap -- --apply
```

El segundo comando utiliza la [API de colecciones de Directus](https://directus.com/docs/api/collections) y comprueba colisiones en todo el espacio `tc_*` antes de escribir. Crea únicamente colecciones y relaciones propias; no actualiza registros de Habitat, configura roles, crea usuarios, modifica permisos públicos ni cambia credenciales. Puede completar una inicialización interrumpida y conservar los registros propios existentes. Un esquema incompatible detiene el proceso. No es una migración transaccional: si falla una solicitud, se conservan los objetos nuevos ya creados y puede repetirse tras resolver la causa.

La relación de imagen principal referencia `directus_files` sin agregar campos a esa colección compartida. Revisar la visibilidad de los archivos elegidos: no ampliar los permisos públicos de toda la biblioteca. Para nuevas cargas se recomienda una carpeta exclusiva de Turismo Cultural y permisos sobre esa carpeta.

Para el servidor web, usar una política de **sólo lectura** limitada a las ocho colecciones `tc_*`, con los campos que consume `src/lib/content.ts`. Limitar artículos y páginas a `status = publish`; limitar relaciones de categorías a artículos publicados. No autorizar escritura ni lectura de colecciones de otros sitios. Configurar el token como `DIRECTUS_TOKEN`, sólo del lado del servidor. Esta política y el acceso editorial al grupo nuevo se configuran en Directus por un administrador; el script no modifica los permisos existentes.

## Recibir artículos de otros sitios cuando se solicite

La integración preparada permite copiar un artículo publicado de `articulos` del CMS compartido a `tc_articles`. Se usa de forma explícita por artículo; no hay importación inicial, feed automático ni sincronización. El token de esta tarea se configura como `DIRECTUS_TRANSFER_TOKEN` en el proceso operador, con lectura del origen, lectura de `tc_articles.id,source_key` y creación en `tc_articles`. Nunca se coloca en el contenedor web.

```powershell
# Lectura y vista previa: no crea contenido.
npm run directus:send-article -- --source-id 123 --source-site "Habitat"
# Copia explícita a borrador después de revisar el origen.
npm run directus:send-article -- --source-id 123 --source-site "Habitat" --apply
```

El destino recibe título, texto, resumen y referencia a la imagen. Registra sitio, colección, ID y fecha de recepción; `--source-url` permite agregar el enlace público original. Una clave de origen única impide duplicados, incluidos envíos simultáneos. Repetir un envío no reemplaza una copia ya editada o publicada. Los autores y las categorías se asignan localmente desde Directus; las relaciones editoriales no se comparten. Los archivos de imagen referenciados siguen perteneciendo a la biblioteca compartida: no se duplican los binarios.

El editor revisa la copia en **Turismo Cultural → Artículos** y decide cuándo publicarla. El botón de envío desde otro panel y fuentes con otros esquemas quedan para una integración posterior; esta versión prepara el proceso operador y la trazabilidad. No instala Flows ni botones en colecciones ajenas.

## Dokploy

Crear o usar el servicio Compose de Turismo Cultural, conectado a esta rama y a `compose.yaml`. Se inicia solamente `web`, puerto interno **3000**. No se crea otro Directus, una base de datos o volúmenes del CMS. Asignar el dominio temporal del sitio al servicio `web`; el CMS mantiene su dominio actual.

Variables de ejecución (ver `directus.example.env`): `DIRECTUS_URL`, `CMS_PUBLIC_URL`, `DIRECTUS_TOKEN`, `SITE_URL` y, para correo, `RESEND_API_KEY`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`. Los secretos se introducen por un canal administrativo cifrado; no se publican en Git, URLs, comandos guardados o variables `NEXT_PUBLIC_*`. El Dockerfile no necesita credenciales para compilar. Los scripts de preparación y transferencia tampoco se incluyen en la imagen web.

Un CMS no configurado o inaccesible produce un error; no se sustituye con artículos antiguos. `/health` comprueba las colecciones necesarias con el token de ejecución. La web revalida los datos cada 60 segundos. Un dominio temporal HTTP es para revisión; configurar dominio definitivo, TLS y correo antes de declarar producción.

## Desarrollo y validación

```powershell
npm ci
npm run dev
npm run test:directus
npm run lint
npm run build
npm run test:runtime
npm test
```

Sin CMS configurado, el desarrollo local muestra cero artículos y los textos iniciales. Las pruebas de Directus usan un API simulado y nunca el CMS real. La comprobación local no acredita permisos ni publicación real en el VPS.
