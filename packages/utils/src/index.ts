import Redis from "ioredis";

// Logger Service
export class Logger {
  static info(message: string, ...args: any[]) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  }

  static error(message: string, ...args: any[]) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  }
}

// Memory Cache fallback
const memoryCache = new Map<string, { value: string; expiry: number }>();

// Cache Service with Redis and In-Memory fallback
export class CacheService {
  private static redisClient: Redis | null = null;
  private static isConnected = false;

  static initialize(redisUrl?: string) {
    if (this.redisClient) return;

    const url = redisUrl || process.env.REDIS_URL || "redis://localhost:6379";
    try {
      this.redisClient = new Redis(url, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) {
            Logger.warn("Redis connection failed. Falling back to In-Memory cache.");
            this.isConnected = false;
            return null; // stop retrying
          }
          return Math.min(times * 100, 2000);
        },
      });

      this.redisClient.on("connect", () => {
        Logger.info("Redis connected successfully.");
        this.isConnected = true;
      });

      this.redisClient.on("error", (err) => {
        Logger.error("Redis Error", err);
        this.isConnected = false;
      });
    } catch (error) {
      Logger.error("Failed to initialize Redis client", error);
      this.isConnected = false;
    }
  }

  static getClient(): Redis | null {
    if (!this.redisClient) {
      this.initialize();
    }
    return this.isConnected ? this.redisClient : null;
  }

  static async get<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    if (client && this.isConnected) {
      try {
        const val = await client.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        Logger.error(`Error getting key: ${key} from Redis`, err);
      }
    }

    // In-Memory Fallback
    const cached = memoryCache.get(key);
    if (cached) {
      if (Date.now() < cached.expiry) {
        return JSON.parse(cached.value);
      }
      memoryCache.delete(key);
    }
    return null;
  }

  static async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const client = this.getClient();
    const serialized = JSON.stringify(value);

    if (client && this.isConnected) {
      try {
        await client.set(key, serialized, "EX", ttlSeconds);
        return;
      } catch (err) {
        Logger.error(`Error setting key: ${key} in Redis`, err);
      }
    }

    // In-Memory Fallback
    memoryCache.set(key, {
      value: serialized,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  static async delete(key: string): Promise<void> {
    const client = this.getClient();
    if (client && this.isConnected) {
      try {
        await client.del(key);
        return;
      } catch (err) {
        Logger.error(`Error deleting key: ${key} in Redis`, err);
      }
    }
    memoryCache.delete(key);
  }

  static async clearPattern(pattern: string): Promise<void> {
    const client = this.getClient();
    if (client && this.isConnected) {
      try {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(...keys);
        }
        return;
      } catch (err) {
        Logger.error(`Error clearing pattern ${pattern} in Redis`, err);
      }
    }

    // Clear memory cache keys matching pattern
    const regex = new RegExp(pattern.replace(/\*/g, ".*"));
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  }
}

// Input Sanitization Service
export class SanitizeService {
  static sanitizeString(input: string): string {
    if (!input) return "";
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
      .trim();
  }

  static sanitizeObject<T = any>(obj: T): T {
    if (!obj || typeof obj !== "object") return obj;

    const result: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if (typeof value === "string") {
          result[key] = this.sanitizeString(value);
        } else if (typeof value === "object") {
          result[key] = this.sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
    }
    return result as T;
  }
}
