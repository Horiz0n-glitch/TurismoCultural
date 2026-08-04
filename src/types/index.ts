export interface Article {
  id: number;
  title: string;
  slug: string;
  content_html: string;
  excerpt: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  status: string;
  author_id: number;
  categories_ids: number[];
  featured_media_id: number | null;
  link: string;
  category_names: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  description?: string;
  parent?: number;
}

export interface User {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  title?: string;
  url: string;
  post_id?: number;
}

export interface BackupData {
  articles: Article[];
  categories: Category[];
  users: User[];
}
