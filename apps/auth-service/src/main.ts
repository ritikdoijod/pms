import { serve } from '@hono/node-server';
import { app } from './app';
import { logger } from '@pms/logger';
import { bootstrap } from './bootstrap';

async function main() {
  try {
    await bootstrap();

    serve(
      {
        fetch: app.fetch,
        port: Number(process.env.PORT || 4001),
      },
      ({ port }) => {
        logger.info(`Auth service is running on port ${port}`);
      }
    );
  } catch (err) {
    logger.error({ err }, 'Failed to start Auth Service:');
    process.exit(1);
  }
}

main();
