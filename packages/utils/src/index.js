"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizeService = exports.CacheService = exports.Logger = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Logger Service
class Logger {
    static info(message, ...args) {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
    static warn(message, ...args) {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
    static error(message, ...args) {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
}
exports.Logger = Logger;
// Memory Cache fallback
const memoryCache = new Map();
// Cache Service with Redis and In-Memory fallback
class CacheService {
    static redisClient = null;
    static isConnected = false;
    static initialize(redisUrl) {
        if (this.redisClient)
            return;
        const url = redisUrl || process.env.REDIS_URL || "redis://localhost:6379";
        try {
            this.redisClient = new ioredis_1.default(url, {
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
        }
        catch (error) {
            Logger.error("Failed to initialize Redis client", error);
            this.isConnected = false;
        }
    }
    static getClient() {
        if (!this.redisClient) {
            this.initialize();
        }
        return this.isConnected ? this.redisClient : null;
    }
    static async get(key) {
        const client = this.getClient();
        if (client && this.isConnected) {
            try {
                const val = await client.get(key);
                return val ? JSON.parse(val) : null;
            }
            catch (err) {
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
    static async set(key, value, ttlSeconds = 300) {
        const client = this.getClient();
        const serialized = JSON.stringify(value);
        if (client && this.isConnected) {
            try {
                await client.set(key, serialized, "EX", ttlSeconds);
                return;
            }
            catch (err) {
                Logger.error(`Error setting key: ${key} in Redis`, err);
            }
        }
        // In-Memory Fallback
        memoryCache.set(key, {
            value: serialized,
            expiry: Date.now() + ttlSeconds * 1000,
        });
    }
    static async delete(key) {
        const client = this.getClient();
        if (client && this.isConnected) {
            try {
                await client.del(key);
                return;
            }
            catch (err) {
                Logger.error(`Error deleting key: ${key} in Redis`, err);
            }
        }
        memoryCache.delete(key);
    }
    static async clearPattern(pattern) {
        const client = this.getClient();
        if (client && this.isConnected) {
            try {
                const keys = await client.keys(pattern);
                if (keys.length > 0) {
                    await client.del(...keys);
                }
                return;
            }
            catch (err) {
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
exports.CacheService = CacheService;
// Input Sanitization Service
class SanitizeService {
    static sanitizeString(input) {
        if (!input)
            return "";
        return input
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;")
            .trim();
    }
    static sanitizeObject(obj) {
        if (!obj || typeof obj !== "object")
            return obj;
        const result = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === "string") {
                    result[key] = this.sanitizeString(value);
                }
                else if (typeof value === "object") {
                    result[key] = this.sanitizeObject(value);
                }
                else {
                    result[key] = value;
                }
            }
        }
        return result;
    }
}
exports.SanitizeService = SanitizeService;
//# sourceMappingURL=index.js.map