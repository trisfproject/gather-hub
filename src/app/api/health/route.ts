import { NextResponse } from 'next/server';
import { db } from '@/db';
import { redis } from '@/lib/redis';
import { sql } from 'drizzle-orm';

export async function GET() {
  let dbStatus = 'ok';
  let redisStatus = 'ok';

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    dbStatus = 'error';
  }

  try {
    await redis.ping();
  } catch {
    redisStatus = 'error';
  }

  const isHealthy = dbStatus === 'ok' && redisStatus === 'ok';

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : 'error',
      service: 'komitkabe-gathering',
      checks: {
        database: dbStatus,
        redis: redisStatus,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}
