import { connection } from 'next/server';
import { getSiteSettings } from '@/lib/content';

export async function GET() {
  await connection();
  try {
    await getSiteSettings();
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
