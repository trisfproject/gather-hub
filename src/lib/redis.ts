import Redis from 'ioredis';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
  });

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

if (env.NODE_ENV !== 'production') globalForRedis.redis = redis;
