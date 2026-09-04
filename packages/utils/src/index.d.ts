import Redis from "ioredis";
export declare class Logger {
    static info(message: string, ...args: any[]): void;
    static warn(message: string, ...args: any[]): void;
    static error(message: string, ...args: any[]): void;
}
export declare class CacheService {
    private static redisClient;
    private static isConnected;
    static initialize(redisUrl?: string): void;
    static getClient(): Redis | null;
    static get<T>(key: string): Promise<T | null>;
    static set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    static delete(key: string): Promise<void>;
    static clearPattern(pattern: string): Promise<void>;
}
export declare class SanitizeService {
    static sanitizeString(input: string): string;
    static sanitizeObject<T = any>(obj: T): T;
}
//# sourceMappingURL=index.d.ts.map