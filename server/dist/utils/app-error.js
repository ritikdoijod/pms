import { STATUS } from './constants.js';

const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
};

class AppError extends Error {
  constructor(statusCode, errorCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

class BadRequestException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.BAD_REQUEST, ERROR_CODES.BAD_REQUEST, message, details);
  }
}

class UnauthorizedException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED, message, details);
  }
}

class ForbiddenException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.FORBIDDEN, ERROR_CODES.FORBIDDEN, message, details);
  }
}

class NotFoundException extends AppError {
  constructor(message, details) {
    super(STATUS.HTTP.NOT_FOUND, ERROR_CODES.NOT_FOUND, message, details);
  }
}

export { AppError, BadRequestException, ERROR_CODES, ForbiddenException, NotFoundException, UnauthorizedException };
