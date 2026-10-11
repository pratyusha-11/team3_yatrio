/**
 * Redis-backed Cache Service for shared infrastructure (Team 7)
 * Made backward-compatible with the original interface for Team 2
 */
const { redis } = require('../../config/redis');

class CacheService {
  constructor(defaultTtlSeconds = 300) {
    this.defaultTtl = parseInt(process.env.CACHE_TTL_SECONDS, 10) || defaultTtlSeconds;
  }

  async get(key) {
    try {
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err) {
      console.error(`Cache get error for key ${key}:`, err);
      return null;
    }
  }

  async set(key, value, ttlSeconds) {
    try {
      const ttl = ttlSeconds ? ttlSeconds : this.defaultTtl;
      const data = JSON.stringify(value);
      await redis.set(key, data, 'EX', ttl);
    } catch (err) {
      console.error(`Cache set error for key ${key}:`, err);
    }
  }

  async del(key) {
    try {
      await redis.del(key);
    } catch (err) {
      console.error(`Cache del error for key ${key}:`, err);
    }
  }

  async flush() {
    try {
      await redis.flushdb();
    } catch (err) {
      console.error('Cache flush error:', err);
    }
  }

  async size() {
    try {
      return await redis.dbsize();
    } catch (err) {
      console.error('Cache size error:', err);
      return 0;
    }
  }
}

module.exports = new CacheService();
