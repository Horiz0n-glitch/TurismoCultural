import backupData from '@/data/backup.json';
import categories from '@/data/categories.json';
import HomeClient from './HomeClient';

export default function HomePage() {
  const { articles } = backupData;

  return <HomeClient articles={articles} categories={categories} />;
}
