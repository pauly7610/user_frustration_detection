import rateLimit, { Store, Options, RateLimitRequestHandler } from 'express-rate-limit';
import { Redis } from 'ioredis';
import { redis } from '../config/redis';
import { Request, Response } from 'express';

interface IRateLimitInfo {
  totalHits: number;
  resetTime: Date;
}

class RedisStore implements Store {
  cleanKey(key: string): string {
    return `ratelimit:${key}`;
  }

  async increment(key: string): Promise<IRateLimitInfo> {
    const redisKey = this.cleanKey(key);
    const hits = await redis.incr(redisKey);
    const ttl = await redis.ttl(redisKey);
    
    if (ttl === -1) {
      await redis.expire(redisKey, 60);
    }

    return {
      totalHits: hits,
      resetTime: new Date(Date.now() + (ttl * 1000))
    };
  }

  async decrement(key: string): Promise<void> {
    const redisKey = this.cleanKey(key);
    await redis.decr(redisKey);
  }

  async resetKey(key: string): Promise<void> {
    const redisKey = this.cleanKey(key);
    await redis.del(redisKey);
  }

  async resetAll(): Promise<void> {
    const keys = await redis.keys('ratelimit:*');
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const createRateLimiter = (
  windowMs: number = 60000,
  max: number = 100
): RateLimitRequestHandler => {
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests, please try again later.',
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore(),
    skipFailedRequests: false,
    skipSuccessfulRequests: false,
    requestWasSuccessful: (req: Request): boolean => {
      return req.statusCode !== undefined ? req.statusCode < 400 : true;
    },
    handler: (req: Request, res: Response): void => {
      res.status(429).json({
        error: 'Too many requests, please try again later.'
      });
    },
    keyGenerator: (req: Request): string => {
      return req.ip || req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress || '0.0.0.0';
    }
  });
};