import 'dotenv/config'
import { serve } from '@hono/node-server';
import { app } from './app';
import { logger } from '@pms/logger';

serve(
  {
    fetch: app.fetch,
    port: 4001,
  },
  ({ port }) => {
    logger.info(`Patient service is listening on port ${port}`);
  }
);
