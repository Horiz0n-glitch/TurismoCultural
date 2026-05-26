/**
 * Slugify: convierte texto a URL-friendly slug
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quita acentos
    .replace(/[^a-z0-9]+/g, '-')      // espacios/símbolos → guión
    .replace(/^-|-$/g, '');           // quita guiones al inicio/final
}

/**
 * Formatea una fecha al formato local argentino
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
