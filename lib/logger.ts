import winston from 'winston';

/**
 * Winston logger configuration
 * Provides structured logging with different levels
 */

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

const transports: winston.transport[] = [
  // Console transport for development
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // Don't exit on uncaught exception
  exitOnError: false,
});

// Create a stream for Morgan (HTTP logging middleware)
export const loggerStream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

/**
 * Type-safe logger methods
 */
export type LoggerContext = Record<string, any>;

export const log = {
  error: (message: string, context?: LoggerContext) => {
    logger.error(message, context);
  },
  
  warn: (message: string, context?: LoggerContext) => {
    logger.warn(message, context);
  },
  
  info: (message: string, context?: LoggerContext) => {
    logger.info(message, context);
  },
  
  debug: (message: string, context?: LoggerContext) => {
    logger.debug(message, context);
  },
  
  http: (message: string, context?: LoggerContext) => {
    logger.http(message, context);
  },
};
