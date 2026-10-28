import { connection } from 'next/server';
import { getContentData, getSiteSettings } from '@/lib/content';
import HomeClient from './HomeClient';

export default async function HomePage() {
  await connection();
  const [{ articles, categories, media }, settings] = await Promise.all([getContentData(), getSiteSettings()]);

  return <HomeClient articles={articles} categories={categories} media={media} settings={settings} />;
}
