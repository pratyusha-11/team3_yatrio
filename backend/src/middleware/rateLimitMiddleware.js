const rateLimit = require('express-rate-limit');
const { MemoryStore } = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const { redis } = require('../config/redis');

class FallbackRedisStore {
  constructor(prefix) {
    this.prefix = prefix;
    this.localKeys = false; // The real Redis store is distributed
    this.redisStore = new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix,
    });
    this.memoryStore = new MemoryStore();
  }

  init(options) {
    if (this.memoryStore.init) {
      this.memoryStore.init(options);
    }
    if (this.redisStore.init) {
      try {
        const p = this.redisStore.init(options);
        if (p && typeof p.catch === 'function') {
          p.catch(() => {});
        }
      } catch (err) {
        // ignore init errors when redis is down
      }
    }
  }

  async increment(key) {
    if (redis.status === 'ready') {
      try {
        return await this.redisStore.increment(key);
      } catch (err) {
        return this.memoryStore.increment(key);
      }
    }
    return this.memoryStore.increment(key);
  }

  async decrement(key) {
    if (redis.status === 'ready') {
      try {
        return await this.redisStore.decrement(key);
      } catch (err) {
        return this.memoryStore.decrement(key);
      }
    }
    return this.memoryStore.decrement(key);
  }

  async resetKey(key) {
    if (redis.status === 'ready') {
      try {
        return await this.redisStore.resetKey(key);
      } catch (err) {
        return this.memoryStore.resetKey(key);
      }
    }
    return this.memoryStore.resetKey(key);
  }
}

// Shared Redis-backed rate limiting middleware for API requests (with in-memory fallback)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  requestPropertyName: 'apiRateLimit',
  message: {
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
  store: new FallbackRedisStore('rl:api:'),
});

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 auth requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  requestPropertyName: 'authRateLimit',
  message: {
    message: 'Too many authentication attempts, please try again after an hour',
  },
  store: new FallbackRedisStore('rl:auth:'),
});

module.exports = {
  apiLimiter,
  authLimiter,
};
