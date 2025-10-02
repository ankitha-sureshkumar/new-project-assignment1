export declare class CacheService {
    private static instance;
    private store;
    private constructor();
    static getInstance(): CacheService;
    get<T>(key: string): T | null;
    set<T>(key: string, value: T, ttlMs: number): void;
    del(key: string): void;
    clear(): void;
}
//# sourceMappingURL=CacheService.d.ts.map