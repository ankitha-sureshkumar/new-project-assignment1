type CacheEntry<T> = { value: T; expiresAt: number };

export class CacheService {
  private static instance: CacheService;
  private store = new Map<string, CacheEntry<any>>();

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) CacheService.instance = new CacheService();
    return CacheService.instance;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    const now = Date.now();
    if (entry.expiresAt < now) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}