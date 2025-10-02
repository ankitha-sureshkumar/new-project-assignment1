"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedAppointmentRepository = void 0;
const AppointmentRepository_1 = require("../AppointmentRepository");
const CacheService_1 = require("../../patterns/decorator/CacheService");
class CachedAppointmentRepository {
    constructor(repo) {
        this.cache = CacheService_1.CacheService.getInstance();
        this.ttlMs = 30 * 1000;
        this.repo = repo || new AppointmentRepository_1.AppointmentRepository();
    }
    key(...parts) {
        return ['aptRepo', ...parts].join(':');
    }
    async findByUser(userId) {
        const k = this.key('findByUser', userId);
        const cached = this.cache.get(k);
        if (cached)
            return cached;
        const res = await this.repo.findByUser(userId);
        this.cache.set(k, res, this.ttlMs);
        return res;
    }
    async findByVeterinarian(vetId) {
        const k = this.key('findByVeterinarian', vetId);
        const cached = this.cache.get(k);
        if (cached)
            return cached;
        const res = await this.repo.findByVeterinarian(vetId);
        this.cache.set(k, res, this.ttlMs);
        return res;
    }
    async findByIdForRole(appointmentId, userId, role) {
        const k = this.key('findByIdForRole', appointmentId, userId, role);
        const cached = this.cache.get(k);
        if (cached)
            return cached;
        const res = await this.repo.findByIdForRole(appointmentId, userId, role);
        this.cache.set(k, res, this.ttlMs);
        return res;
    }
    async findConflict(vetId, date, time, excludeId) {
        return this.repo.findConflict(vetId, date, time, excludeId);
    }
    async create(data) {
        const res = await this.repo.create(data);
        this.cache.del(this.key('findByUser', res.user.toString()));
        this.cache.del(this.key('findByVeterinarian', res.veterinarian.toString()));
        return res;
    }
    async updateById(id, patch) {
        const res = await this.repo.updateById(id, patch);
        return res;
    }
}
exports.CachedAppointmentRepository = CachedAppointmentRepository;
//# sourceMappingURL=CachedAppointmentRepository.js.map