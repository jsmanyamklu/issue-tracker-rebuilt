import { NextRequest, NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis-based rate limiting
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  max: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Custom message when rate limit is exceeded
   */
  message?: string;
  /**
   * Skip rate limiting for certain conditions
   */
  skip?: (req: NextRequest) => boolean;
}

/**
 * Creates a rate limiting middleware
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    max,
    windowMs,
    message = 'Too many requests, please try again later.',
    skip,
  } = config;

  return async function rateLimitMiddleware(
    req: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    // Skip if condition is met
    if (skip && skip(req)) {
      return handler();
    }

    // Get identifier (IP address or user ID from session)
    const identifier = getIdentifier(req);

    // Get current time
    const now = Date.now();

    // Initialize or get rate limit data
    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    store[identifier].count++;

    // Check if limit exceeded
    if (store[identifier].count > max) {
      const resetTimeSeconds = Math.ceil((store[identifier].resetTime - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfter: resetTimeSeconds,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': max.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil(store[identifier].resetTime / 1000).toString(),
            'Retry-After': resetTimeSeconds.toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = await handler();

    // Clone response to add headers
    const newResponse = NextResponse.json(await response.json(), {
      status: response.status,
      headers: response.headers,
    });

    newResponse.headers.set('X-RateLimit-Limit', max.toString());
    newResponse.headers.set(
      'X-RateLimit-Remaining',
      Math.max(0, max - store[identifier].count).toString()
    );
    newResponse.headers.set(
      'X-RateLimit-Reset',
      Math.ceil(store[identifier].resetTime / 1000).toString()
    );

    return newResponse;
  };
}

/**
 * Get identifier for rate limiting
 * Uses IP address as fallback, but prioritizes user session if available
 */
function getIdentifier(req: NextRequest): string {
  // Try to get user ID from session/token (if implemented)
  // For now, use IP address

  // Check various headers for IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Predefined rate limiters for common use cases
 */

// Strict rate limit for authentication endpoints (10 requests per 15 minutes)
export const authRateLimit = createRateLimiter({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

// Standard rate limit for API endpoints (100 requests per minute)
export const apiRateLimit = createRateLimiter({
  max: 100,
  windowMs: 60 * 1000,
  message: 'Too many API requests. Please slow down.',
});

// Relaxed rate limit for read-only endpoints (200 requests per minute)
export const readRateLimit = createRateLimiter({
  max: 200,
  windowMs: 60 * 1000,
  message: 'Too many requests. Please slow down.',
});

// Strict rate limit for write operations (30 requests per minute)
export const writeRateLimit = createRateLimiter({
  max: 30,
  windowMs: 60 * 1000,
  message: 'Too many write operations. Please slow down.',
});
