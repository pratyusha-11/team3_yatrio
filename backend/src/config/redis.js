const Redis = require('ioredis');
require('dotenv').config();

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  db: process.env.REDIS_DB || 0,
  maxRetriesPerRequest: 1, // Reduced to 1 to fail fast if Redis is down
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
};

const redis = new Redis(redisConfig);

redis.on('connect', () => {
  console.log('✅ Redis connected successfully.');
});

let lastErrorTime = 0;
redis.on('error', (err) => {
  const now = Date.now();
  if (now - lastErrorTime > 10000) {
    console.error('❌ Redis connection error:', err.message);
    lastErrorTime = now;
  }
});

/**
 * Health check function for Redis
 * @returns {Promise<boolean>}
 */
const checkRedisHealth = async () => {
  try {
    await redis.ping();
    return true;
  } catch (error) {
    return false;
  }
};

module.exports = {
  redis,
  checkRedisHealth,
};
