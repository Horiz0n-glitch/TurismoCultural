import { connection } from 'next/server';
import { checkCmsConnection } from '@/lib/content';

export async function GET() {
  await connection();
  try {
    await checkCmsConnection();
    return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ status: 'unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
