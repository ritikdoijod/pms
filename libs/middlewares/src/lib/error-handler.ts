import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { logger } from '@pms/logger';

export class AppError extends Error {
  public readonly statusCode: ContentfulStatusCode;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: ContentfulStatusCode,
    isOperational = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this);
  }
}

// Not Found Exception
export class NotFoundException extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

// Bad Request Exception
export class BadRequestException extends AppError {
  constructor(message = 'Invalid request data', details?: any) {
    super(message, 400, true, details);
  }
}

// Unauthorized Exception
export class UnauthorizedException extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

// Forbidden Exception
export class ForbiddenException extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

// Internal Server Exception
export class InternalServerException extends AppError {
  constructor(message = 'Internal Server Exception') {
    super(message, 500);
  }
}

// Rate Limit Exception
export class RateLimitException extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super(message, 429);
  }
}

export function errorHandler(err: Error | AppError, c: Context) {
  if (
    ['TokenExpiredError', 'JsonWebTokenError', 'NotBeforeError'].includes(
      err.name
    )
  ) {
    logger.error({ err }, 'JwtError');
    err = new UnauthorizedException(
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : err.name === 'JsonWebTokenError'
        ? 'Invalid token. Please log in again.'
        : 'Token is not active yet. Please try again later.'
    );
  }

  if (err instanceof AppError) {
    logger.error({ err, req: c.req }, 'App Error');
    return c.json(
      {
        status: 'error',
        message: err.message,
        ...(err.details && { details: err.details }),
      },
      err.statusCode
    );
  }

  logger.error({ err }, 'Unexpected Error.');

  return c.json(
    {
      status: 'error',
      message: 'Something went wrong, please try again!',
    },
    500
  );
}
