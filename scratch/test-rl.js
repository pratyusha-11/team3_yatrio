const { MemoryStore } = require('express-rate-limit');
const RedisStore = require('rate-limit-redis').default;
const Redis = require('ioredis');

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: 1, // small to fail fast
  retryStrategy: () => null // don't retry for the test
});

redis.on('error', () => {}); // silence connection errors

class FallbackRedisStore {
  constructor(prefix) {
    this.redisStore = new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix,
    });
    this.memoryStore = new MemoryStore();
  }

  init(options) {
    if (this.memoryStore.init) this.memoryStore.init(options);
    if (this.redisStore.init) {
      try {
        const p = this.redisStore.init(options);
        if (p && p.catch) p.catch(() => {});
      } catch (e) {}
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
}

async function test() {
  const store = new FallbackRedisStore('rl:test:');
  store.init({ windowMs: 1000 });
  console.log('init done');
  
  const res1 = await store.increment('ip1');
  console.log('res1', res1);
  process.exit(0);
}

test();
