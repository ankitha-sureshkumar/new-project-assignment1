"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedPetRepository = void 0;
const PetRepository_1 = require("../PetRepository");
const CacheService_1 = require("../../patterns/decorator/CacheService");
class CachedPetRepository {
    constructor(repo) {
        this.cache = CacheService_1.CacheService.getInstance();
        this.ttlMs = 60 * 1000;
        this.repo = repo || new PetRepository_1.PetRepository();
    }
    key(...parts) { return ['petRepo', ...parts].join(':'); }
    async listByOwner(ownerId) {
        const k = this.key('listByOwner', ownerId);
        const cached = this.cache.get(k);
        if (cached)
            return cached;
        const res = await this.repo.listByOwner(ownerId);
        this.cache.set(k, res, this.ttlMs);
        return res;
    }
}
exports.CachedPetRepository = CachedPetRepository;
//# sourceMappingURL=CachedPetRepository.js.map