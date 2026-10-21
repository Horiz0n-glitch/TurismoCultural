import localBackupData from '@/data/backup.json';
import localMediaData from '@/data/media.json';
import { slugify } from '@/lib/utils';
import type { Article, BackupData, Category, MediaItem, User } from '@/types';

type RecordValue = Record<string, unknown>;

export interface SiteSettings {
  site_name: string;
  site_description: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_highlight: string;
  hero_description: string;
  hero_cta_label: string;
  hero_cta_href: string;
  hero_caption: string;
  about_html: string;
  contact_email: string;
  contact_location: string;
  facebook_url: string;
  instagram_url: string;
  x_url: string;
  footer_description: string;
  seo_keywords: string;
}

export interface NavigationItem {
  id: number;
  label: string;
  href: string;
  section: 'provinces' | 'topics' | 'footer_sections' | 'footer_provinces';
  sort: number;
  enabled: boolean;
}

export interface ContentPage {
  id: number;
  title: string;
  slug: string;
  status: string;
  subtitle: string;
  content_html: string;
  seo_description: string;
}

const directusUrl = process.env.DIRECTUS_URL?.replace(/\/+$/, '');
const directusToken = process.env.DIRECTUS_TOKEN;
export const siteUrl = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');

const string = (value: unknown, fallback = '') => typeof value === 'string' ? value : value == null ? fallback : String(value);
const number = (value: unknown, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const record = (value: unknown): RecordValue => value && typeof value === 'object' ? value as RecordValue : {};

export const defaultSettings: SiteSettings = {
  site_name: 'Turismo Cultural',
  site_description: 'Portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
  hero_eyebrow: 'Revista de turismo y cultura',
  hero_title: 'Descubre',
  hero_highlight: 'el Turismo Cultural',
  hero_description: 'Noticias, eventos, ferias y todo sobre la riqueza cultural de Argentina y el mundo. Tu portal de referencia para el turismo cultural.',
  hero_cta_label: 'Ver destacados',
  hero_cta_href: '/categoria/destacadas',
  hero_caption: 'Argentina y el mundo',
  about_html: '<p><strong>Turismo Cultural</strong> es un portal de noticias dedicado a la promoción del turismo cultural en Argentina y el mundo.</p><p>Difundimos eventos, exposiciones, ferias, museos, gastronomía y patrimonio cultural.</p>',
  contact_email: 'info@turismocultural.com.ar',
  contact_location: 'Argentina',
  facebook_url: '', instagram_url: '', x_url: '',
  footer_description: 'Portal de noticias dedicado al turismo cultural en Argentina y el mundo.',
  seo_keywords: 'turismo cultural, argentina, noticias turismo, cultura, eventos, museos, gastronomía',
};

const defaultNavigation: NavigationItem[] = [
  ...localBackupData.categories.slice(0, 26).map((category, index) => ({
    id: index + 1, label: category.name, href: `/categoria/${category.slug || slugify(category.name)}`,
    section: 'provinces' as const, sort: index + 1, enabled: true,
  })),
  { id: 100, label: 'Noticias', href: '/categoria/noticias', section: 'topics', sort: 1, enabled: true },
  { id: 101, label: 'Quiénes Somos', href: '/quienes-somos', section: 'topics', sort: 2, enabled: true },
  { id: 102, label: 'Contacto', href: '/contacto', section: 'topics', sort: 3, enabled: true },
];

async function fetchCollection(collection: string): Promise<RecordValue[]> {
  if (!directusUrl) {
    if (process.env.NODE_ENV === 'production') throw new Error('DIRECTUS_URL requerido en producción');
    return [];
  }
  if (process.env.NODE_ENV === 'production' && !directusToken) throw new Error('DIRECTUS_TOKEN requerido en producción');

  const all: RecordValue[] = [];
  let offset = 0;
  while (true) {
    const url = `${directusUrl}/items/${encodeURIComponent(collection)}?limit=500&offset=${offset}`;
    const response = await fetch(url, {
      headers: directusToken ? { Authorization: `Bearer ${directusToken}` } : undefined,
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error(`Directus respondió ${response.status} al consultar ${collection}`);
    const payload = await response.json() as { data?: RecordValue[] };
    const page = Array.isArray(payload.data) ? payload.data : [];
    all.push(...page);
    if (page.length < 500) return all;
    offset += page.length;
  }
}

const localContent: BackupData = {
  articles: localBackupData.articles as Article[],
  categories: localBackupData.categories as Category[],
  users: localBackupData.users as User[],
  media: localMediaData.map(item => ({
    id: item.id,
    title: item.title || undefined,
    url: item.url || '',
    post_id: item.post_id || undefined,
  })),
};

export async function getContentData(): Promise<BackupData> {
  if (!directusUrl && process.env.NODE_ENV !== 'production') return localContent;

  const [rawArticles, rawCategories, rawAuthors, rawMedia, links] = await Promise.all([
    fetchCollection('articles'), fetchCollection('categories'), fetchCollection('authors'),
    fetchCollection('media'), fetchCollection('articles_categories'),
  ]);

  const categoryById = new Map(rawCategories.map(item => [number(item.id), item]));
  const articleCategories = new Map<number, number[]>();
  for (const link of links) {
    const articleId = number(link.article_id);
    const ids = articleCategories.get(articleId) || [];
    ids.push(number(link.category_id));
    articleCategories.set(articleId, ids);
  }

  const articles: Article[] = rawArticles.filter(item => item.status === 'publish').map(item => {
    const id = number(item.id);
    const categoryIds = articleCategories.get(id) || [];
    return {
      id, title: string(item.title), slug: string(item.slug, String(id)),
      content_html: string(item.content_html), excerpt: string(item.excerpt),
      date_created: string(item.date_created), date_created_gmt: string(item.date_created),
      date_modified: string(item.date_modified), date_modified_gmt: string(item.date_modified),
      status: string(item.status), author_id: number(item.author_id),
      categories_ids: categoryIds, featured_media_id: item.featured_image ? -id : item.featured_media_id ? number(item.featured_media_id) : null,
      link: string(item.link), category_names: categoryIds.map(categoryId => string(categoryById.get(categoryId)?.name)).filter(Boolean),
      featured_image: string(item.featured_image) || undefined,
    };
  });

  const counts = new Map<number, number>();
  for (const article of articles) for (const id of article.categories_ids) counts.set(id, (counts.get(id) || 0) + 1);
  const categories: Category[] = rawCategories.map(item => ({
    id: number(item.id), name: string(item.name), slug: string(item.slug, slugify(string(item.name))),
    count: counts.get(number(item.id)) || 0, description: string(item.description), parent: number(item.parent),
  }));
  const users: User[] = rawAuthors.map(item => ({ id: number(item.id), name: string(item.name) }));
  const media: MediaItem[] = rawMedia.map(item => ({
    id: number(item.id), title: string(item.title), url: string(item.url), post_id: number(item.post_id),
  }));
  for (const article of articles) {
    if (article.featured_image) media.push({ id: -article.id, url: `${getDirectusPublicUrl()}/assets/${article.featured_image}` });
  }
  return { articles, categories, users, media };
}

export function getDirectusPublicUrl() {
  return (process.env.CMS_PUBLIC_URL || directusUrl || '').replace(/\/+$/, '');
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!directusUrl && process.env.NODE_ENV !== 'production') return defaultSettings;
  const items = await fetchCollection('site_settings');
  const source = record(items[0]);
  return Object.fromEntries(Object.entries(defaultSettings).map(([key, fallback]) => [key, string(source[key], fallback)])) as unknown as SiteSettings;
}

export async function getNavigation(): Promise<NavigationItem[]> {
  if (!directusUrl && process.env.NODE_ENV !== 'production') return defaultNavigation;
  return (await fetchCollection('navigation_items')).map(item => ({
    id: number(item.id), label: string(item.label), href: string(item.href),
    section: string(item.section) as NavigationItem['section'], sort: number(item.sort), enabled: item.enabled !== false,
  })).filter(item => item.enabled && (item.href.startsWith('/') || item.href.startsWith('https://')))
    .sort((a, b) => a.sort - b.sort);
}

export async function getPage(slug: string): Promise<ContentPage | null> {
  if (!directusUrl && process.env.NODE_ENV !== 'production') {
    if (slug === 'quienes-somos') return {
      id: 1, title: 'Quiénes Somos', slug, status: 'publish', subtitle: 'Conocé nuestro proyecto',
      content_html: defaultSettings.about_html || '<p>Turismo Cultural: noticias, eventos y patrimonio cultural.</p>',
      seo_description: defaultSettings.site_description,
    };
    return null;
  }
  const item = (await fetchCollection('pages')).find(page => page.slug === slug && page.status === 'publish');
  if (!item) return null;
  return {
    id: number(item.id), title: string(item.title), slug: string(item.slug), status: string(item.status),
    subtitle: string(item.subtitle), content_html: string(item.content_html), seo_description: string(item.seo_description),
  };
}

export async function getPublishedPages(): Promise<ContentPage[]> {
  if (!directusUrl && process.env.NODE_ENV !== 'production') return [];
  return (await fetchCollection('pages')).filter(item => item.status === 'publish').map(item => ({
    id: number(item.id), title: string(item.title), slug: string(item.slug), status: string(item.status),
    subtitle: string(item.subtitle), content_html: string(item.content_html), seo_description: string(item.seo_description),
  }));
}
