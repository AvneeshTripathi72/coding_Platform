import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

/**
 * In-memory Array/Map storage to replace or fallback Redis.
 * Supports Key-Value with TTL, Array/List operations (RPUSH, LRANGE), and Blacklist.
 */
class InMemoryStore {
  constructor() {
    this.store = new Map(); // key -> { value, expiry }
    this.lists = new Map(); // key -> { items: [], expiry }
    this.blacklist = [];    // array of blacklisted token strings
  }

  isExpired(entry) {
    if (!entry || !entry.expiry) return false;
    return Date.now() > entry.expiry;
  }

  async get(key) {
    // Check blacklist array helper
    if (key.startsWith('blacklist:')) {
      const token = key.replace('blacklist:', '');
      return this.blacklist.includes(token) ? 'blacklisted' : null;
    }

    const entry = this.store.get(key);
    if (!entry) return null;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key, value, options = {}) {
    // Handle blacklist array
    if (key.startsWith('blacklist:')) {
      const token = key.replace('blacklist:', '');
      if (!this.blacklist.includes(token)) {
        this.blacklist.push(token);
      }
    }

    let expiry = null;
    if (options.EX) {
      expiry = Date.now() + options.EX * 1000;
    } else if (options.PX) {
      expiry = Date.now() + options.PX;
    }

    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(key) {
    if (key.startsWith('blacklist:')) {
      const token = key.replace('blacklist:', '');
      const idx = this.blacklist.indexOf(token);
      if (idx !== -1) this.blacklist.splice(idx, 1);
    }
    const deleted = this.store.delete(key) || this.lists.delete(key);
    return deleted ? 1 : 0;
  }

  async rPush(key, value) {
    let entry = this.lists.get(key);
    if (!entry || this.isExpired(entry)) {
      entry = { items: [], expiry: null };
      this.lists.set(key, entry);
    }
    entry.items.push(value);
    return entry.items.length;
  }

  async lRange(key, start, stop) {
    const entry = this.lists.get(key);
    if (!entry) return [];
    if (this.isExpired(entry)) {
      this.lists.delete(key);
      return [];
    }
    const items = entry.items;
    const end = stop === -1 ? items.length : stop + 1;
    return items.slice(start, end);
  }

  async expire(key, seconds) {
    const expiry = Date.now() + seconds * 1000;
    let found = false;
    if (this.store.has(key)) {
      const entry = this.store.get(key);
      entry.expiry = expiry;
      found = true;
    }
    if (this.lists.has(key)) {
      const entry = this.lists.get(key);
      entry.expiry = expiry;
      found = true;
    }
    return found;
  }
}

// Instantiate in-memory array/map store
export const memoryStore = new InMemoryStore();

let client = null;
let isConnected = false;

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST;
const isRedisConfigured = Boolean(redisUrl || redisHost);

if (isRedisConfigured) {
  try {
    const clientConfig = redisUrl
      ? {
          url: redisUrl,
          socket: {
            reconnectStrategy: () => false,
            connectTimeout: 3000,
          },
        }
      : {
          username: process.env.REDIS_USERNAME || undefined,
          password: process.env.REDIS_PASSWORD || undefined,
          socket: {
            host: redisHost,
            port: Number(process.env.REDIS_PORT) || 6379,
            reconnectStrategy: () => false,
            connectTimeout: 3000,
          },
        };

    client = createClient(clientConfig);
    client.on('error', (err) => {
      console.warn('Redis unavailable, using in-memory store instead:', err.message);
      isConnected = false;
    });
    client.on('connect', () => {
      isConnected = true;
    });
  } catch (err) {
    console.warn('Failed to initialize Redis client, using in-memory store:', err.message);
  }
} else {
  console.log('⚡ Using In-Memory Array/Map store for tokens & caching (No external Redis required).');
}

const connectRedis = async () => {
  if (!client || isConnected || client.isOpen) {
    return client;
  }

  try {
    await client.connect();
    isConnected = true;
    console.log('Redis connected successfully');
  } catch (err) {
    console.warn('Redis connection failed, defaulting to in-memory store:', err.message);
    isConnected = false;
  }
  return client;
};

// Unified safe wrapper: uses Redis if connected, otherwise in-memory array store
export const safeRedis = {
  get: async (key) => {
    if (client && client.isOpen && isConnected) {
      try {
        return await client.get(key);
      } catch (e) {
        console.warn(`Redis GET failed, falling back to memoryStore:`, e.message);
      }
    }
    return await memoryStore.get(key);
  },

  set: async (key, value, options) => {
    if (client && client.isOpen && isConnected) {
      try {
        return await client.set(key, value, options);
      } catch (e) {
        console.warn(`Redis SET failed, falling back to memoryStore:`, e.message);
      }
    }
    return await memoryStore.set(key, value, options);
  },

  del: async (key) => {
    if (client && client.isOpen && isConnected) {
      try {
        return await client.del(key);
      } catch (e) {
        console.warn(`Redis DEL failed, falling back to memoryStore:`, e.message);
      }
    }
    return await memoryStore.del(key);
  },

  lRange: async (key, start, stop) => {
    if (client && client.isOpen && isConnected) {
      try {
        return await client.lRange(key, start, stop);
      } catch (e) {
        console.warn(`Redis LRANGE failed, falling back to memoryStore:`, e.message);
      }
    }
    return await memoryStore.lRange(key, start, stop);
  },

  rPush: async (key, value) => {
    if (client && client.isOpen && isConnected) {
      try {
        return await client.rPush(key, value);
      } catch (e) {
        console.warn(`Redis RPUSH failed, falling back to memoryStore:`, e.message);
      }
    }
    return await memoryStore.rPush(key, value);
  },

  expire: async (key, seconds) => {
    if (client && client.isOpen && isConnected) {
      try {
        return await client.expire(key, seconds);
      } catch (e) {
        console.warn(`Redis EXPIRE failed, falling back to memoryStore:`, e.message);
      }
    }
    return await memoryStore.expire(key, seconds);
  }
};

export { client, connectRedis, isRedisConfigured };
