/**
 * Application error codes
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Scraping errors
  CONSUMER_NOT_FOUND = 'CONSUMER_NOT_FOUND',
  SCRAPING_FAILED = 'SCRAPING_FAILED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  INCOMPLETE_DATA = 'INCOMPLETE_DATA',
  
  // Network errors
  TIMEOUT = 'TIMEOUT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Database errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Generic errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convert to JSON response format
   */
  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

/**
 * Error factory functions for common errors
 */
export const Errors = {
  unauthorized: (message = 'Unauthorized access') =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  validation: (message = 'Invalid request data', details?: any) =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400, details),

  rateLimitExceeded: (resetIn: number) =>
    new AppError(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `Too many requests. Please try again in ${resetIn} seconds`,
      429
    ),

  consumerNotFound: (consumerNumber?: string) =>
    new AppError(
      ErrorCode.CONSUMER_NOT_FOUND,
      `Consumer ${consumerNumber ? `'${consumerNumber}' ` : ''}not found`,
      404
    ),

  timeout: (message = 'Request timeout') =>
    new AppError(ErrorCode.TIMEOUT, message, 504),

  networkError: (message = 'Network error occurred') =>
    new AppError(ErrorCode.NETWORK_ERROR, message, 503),

  databaseError: (message = 'Database error occurred') =>
    new AppError(ErrorCode.DATABASE_ERROR, message, 500),

  internal: (message = 'Internal server error') =>
    new AppError(ErrorCode.INTERNAL_ERROR, message, 500),
};
