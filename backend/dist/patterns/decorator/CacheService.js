"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
class CacheService {
    constructor() {
        this.store = new Map();
    }
    static getInstance() {
        if (!CacheService.instance)
            CacheService.instance = new CacheService();
        return CacheService.instance;
    }
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return null;
        const now = Date.now();
        if (entry.expiresAt < now) {
            this.store.delete(key);
            return null;
        }
        return entry.value;
    }
    set(key, value, ttlMs) {
        const expiresAt = Date.now() + ttlMs;
        this.store.set(key, { value, expiresAt });
    }
    del(key) {
        this.store.delete(key);
    }
    clear() {
        this.store.clear();
    }
}
exports.CacheService = CacheService;
//# sourceMappingURL=CacheService.js.map