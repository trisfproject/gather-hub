import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  
  AUTH_SECRET: z.string().min(1),
  APP_URL: z.string().url(),
  
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  
  WHATSAPP_API_KEY: z.string().optional(),
  WHATSAPP_PROVIDER_URL: z.string().optional(),
  
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
