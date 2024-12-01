// slapjack/server/src/middleware/rateLimiter.js
import { RedisManager } from '../services/RedisManager.js';

class RateLimiter {
  constructor() {
    this.redis = new RedisManager();
    this.limits = {
      global: { points: 100, duration: 60 },
      slap: { points: 3, duration: 1 },
      play: { points: 1, duration: 1 }
    };
  }

  middleware(type = 'global') {
    return async (req, res, next) => {
      try {
        const key = `ratelimit:${type}:${req.ip}`;
        const limit = this.limits[type];

        const current = await this.redis.incr(key);
        if (current === 1) {
          await this.redis.expire(key, limit.duration);
        }

        if (current > limit.points) {
          return res.status(429).json({
            error: 'Too many requests',
            retryAfter: limit.duration
          });
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

export const rateLimiter = new RateLimiter();
export const rateLimitMiddleware = (type) => rateLimiter.middleware(type);
