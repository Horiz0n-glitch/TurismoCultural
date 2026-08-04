import backupData from '@/data/backup.json';
import categoriesData from '@/data/categories.json';
import HomeClient from './HomeClient';

export default function HomePage() {
  const { articles } = backupData;
  const { categories } = categoriesData;

  return <HomeClient articles={articles} categories={categories} />;
}
