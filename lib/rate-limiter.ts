/**
 * Rate limiter implementation
 * Prevents abuse by limiting the number of requests per user
 */

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;  // Seconds until reset
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private configs: Map<string, RateLimitConfig> = new Map();

  constructor() {
    // Define rate limit configurations for different operations
    this.configs.set('scrape', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 requests per minute
    });

    this.configs.set('api', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60, // 60 requests per minute
    });

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request is allowed for the given key and operation
   */
  async check(key: string, operation: string = 'api'): Promise<RateLimitResult> {
    const config = this.configs.get(operation);
    
    if (!config) {
      // If no config, allow the request
      return {
        success: true,
        remaining: Infinity,
        resetIn: 0,
      };
    }

    const now = Date.now();
    const limitKey = `${operation}:${key}`;
    const entry = this.limits.get(limitKey);

    // No existing entry or entry has expired
    if (!entry || now >= entry.resetAt) {
      this.limits.set(limitKey, {
        count: 1,
        resetAt: now + config.windowMs,
      });

      return {
        success: true,
        remaining: config.maxRequests - 1,
        resetIn: Math.ceil(config.windowMs / 1000),
      };
    }

    // Entry exists and is still valid
    if (entry.count < config.maxRequests) {
      entry.count++;
      
      return {
        success: true,
        remaining: config.maxRequests - entry.count,
        resetIn: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    // Limit exceeded
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string, operation: string = 'api'): void {
    const limitKey = `${operation}:${key}`;
    this.limits.delete(limitKey);
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string, operation: string = 'api'): RateLimitResult | null {
    const config = this.configs.get(operation);
    
    if (!config) {
      return null;
    }

    const now = Date.now();
    const limitKey = `${operation}:${key}`;
    const entry = this.limits.get(limitKey);

    if (!entry || now >= entry.resetAt) {
      return {
        success: true,
        remaining: config.maxRequests,
        resetIn: 0,
      };
    }

    return {
      success: entry.count < config.maxRequests,
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetIn: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.limits.entries()) {
      if (now >= entry.resetAt) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.limits.delete(key));
  }

  /**
   * Add or update rate limit configuration
   */
  setConfig(operation: string, config: RateLimitConfig): void {
    this.configs.set(operation, config);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit middleware for Next.js API routes
 */
export async function checkRateLimit(
  request: Request,
  operation: string = 'api'
): Promise<RateLimitResult> {
  // Extract identifier (IP address or user ID)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  
  return rateLimiter.check(ip, operation);
}
