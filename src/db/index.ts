import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/config/env';
import * as schema from './schema';

// Using a singleton for development to avoid multiple connections
const globalForDb = globalThis as unknown as {
  queryClient: postgres.Sql | undefined;
};

const queryClient = globalForDb.queryClient ?? postgres(env.DATABASE_URL, { prepare: false });

if (env.NODE_ENV !== 'production') globalForDb.queryClient = queryClient;

export const db = drizzle(queryClient, { schema });
