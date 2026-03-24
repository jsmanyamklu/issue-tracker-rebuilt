import winston from 'winston';
import path from 'path';

/**
 * Production-grade logger using Winston
 * Provides structured logging with different levels and transports
 */

const { combine, timestamp, json, printf, colorize, errors } = winston.format;

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Custom format for console output in development
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;

  // Add metadata if present
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }

  return msg;
});

// Create transports array
const transports: winston.transport[] = [];

// Console transport for all environments
if (process.env.NODE_ENV !== 'test') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
    })
  );
}

// File transports for production
if (process.env.NODE_ENV === 'production') {
  const logsDir = path.join(process.cwd(), 'logs');

  // All logs
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Error logs
  transports.push(
    new winston.transports.File({
      level: 'error',
      filename: path.join(logsDir, 'error.log'),
      format: combine(
        timestamp(),
        errors({ stack: true }),
        json()
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

/**
 * Wrapper functions for typed logging with context
 */
export const log = {
  error: (message: string, meta?: Record<string, any>) => {
    logger.error(message, meta);
  },

  warn: (message: string, meta?: Record<string, any>) => {
    logger.warn(message, meta);
  },

  info: (message: string, meta?: Record<string, any>) => {
    logger.info(message, meta);
  },

  http: (message: string, meta?: Record<string, any>) => {
    logger.http(message, meta);
  },

  debug: (message: string, meta?: Record<string, any>) => {
    logger.debug(message, meta);
  },

  /**
   * Log database queries
   */
  query: (query: string, duration?: number) => {
    logger.debug('Database Query', {
      query,
      duration: duration ? `${duration}ms` : undefined,
    });
  },

  /**
   * Log API requests
   */
  request: (method: string, url: string, statusCode: number, duration: number, meta?: Record<string, any>) => {
    logger.http('API Request', {
      method,
      url,
      statusCode,
      duration: `${duration}ms`,
      ...meta,
    });
  },

  /**
   * Log authentication events
   */
  auth: (event: string, userId?: string, meta?: Record<string, any>) => {
    logger.info('Auth Event', {
      event,
      userId,
      ...meta,
    });
  },

  /**
   * Log security events
   */
  security: (event: string, meta?: Record<string, any>) => {
    logger.warn('Security Event', {
      event,
      ...meta,
    });
  },
};

// Export the raw logger for advanced use cases
export { logger };

export default log;
