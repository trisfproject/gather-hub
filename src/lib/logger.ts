import pino from 'pino';
import { env } from '@/config/env';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        }
      : undefined,
  redact: {
    paths: [
      'email',
      'whatsapp',
      'whatsappNumber',
      'telegram',
      'telegramId',
      'telegramUsername',
      'licensePlate',
      'password',
      'secret',
      'apiKey',
      'token',
      'qrToken',
      'sessionToken',
      // Wildcards for nested objects
      '*.email',
      '*.whatsapp',
      '*.telegram',
      '*.password',
      '*.token'
    ],
    censor: '[REDACTED]',
  },
});
