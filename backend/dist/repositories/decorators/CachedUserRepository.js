"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedUserRepository = void 0;
const UserRepository_1 = require("../UserRepository");
const CacheService_1 = require("../../patterns/decorator/CacheService");
class CachedUserRepository {
    constructor(repo) {
        this.cache = CacheService_1.CacheService.getInstance();
        this.ttlMs = 60 * 1000;
        this.repo = repo || new UserRepository_1.UserRepository();
    }
    key(...parts) { return ['userRepo', ...parts].join(':'); }
    async findById(id) {
        const k = this.key('findById', id);
        const cached = this.cache.get(k);
        if (cached)
            return cached;
        const res = await this.repo.findById(id);
        this.cache.set(k, res, this.ttlMs);
        return res;
    }
    async findByEmail(email) { return this.repo.findByEmail(email); }
    async list(limit) { return this.repo.list(limit); }
}
exports.CachedUserRepository = CachedUserRepository;
//# sourceMappingURL=CachedUserRepository.js.map