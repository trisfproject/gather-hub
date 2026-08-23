import { Worker } from 'bullmq';
import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';

export const startWorker = () => {
  logger.info('Starting BullMQ worker process...');

  const worker = new Worker(
    'komitkabe-queue',
    async (job) => {
      logger.info({ jobId: job.id, name: job.name }, 'Processing job');
      return { status: 'ok' };
    },
    { connection: redis }
  );

  worker.on('ready', () => {
    logger.info('Worker is ready and listening for jobs');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Job failed');
  });

  const shutdown = async () => {
    logger.info('Shutting down worker gracefully...');
    await worker.close();
    logger.info('Worker shut down successfully.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return worker;
};

// Start the worker if this file is executed directly
if (process.argv[1] && process.argv[1].endsWith('workers/index.ts')) {
  startWorker();
}
