import pino from 'pino';

const config = {
  level: process.env.LOG_LEVEL || 'info',
  base: {
    service: process.env.SERVICE_NAME || 'pms',
    env: process.env.NODE_ENV,
  },
};

export const logger = pino(
  config
);
