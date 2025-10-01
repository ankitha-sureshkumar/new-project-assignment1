import { AppointmentRepository, IAppointmentRepository } from '../AppointmentRepository';
import { IAppointment } from '../../models/Appointment';
import { CacheService } from '../../patterns/decorator/CacheService';

export class CachedAppointmentRepository implements IAppointmentRepository {
  private cache = CacheService.getInstance();
  private ttlMs = 30 * 1000; // 30 seconds cache
  private repo: AppointmentRepository;

  constructor(repo?: AppointmentRepository) {
    this.repo = repo || new AppointmentRepository();
  }

  private key(...parts: any[]): string {
    return ['aptRepo', ...parts].join(':');
  }

  async findByUser(userId: string): Promise<IAppointment[]> {
    const k = this.key('findByUser', userId);
    const cached = this.cache.get<IAppointment[]>(k);
    if (cached) return cached;
    const res = await this.repo.findByUser(userId);
    this.cache.set(k, res, this.ttlMs);
    return res;
  }

  async findByVeterinarian(vetId: string): Promise<IAppointment[]> {
    const k = this.key('findByVeterinarian', vetId);
    const cached = this.cache.get<IAppointment[]>(k);
    if (cached) return cached;
    const res = await this.repo.findByVeterinarian(vetId);
    this.cache.set(k, res, this.ttlMs);
    return res;
  }

  async findByIdForRole(appointmentId: string, userId: string, role: 'user' | 'veterinarian'): Promise<IAppointment | null> {
    const k = this.key('findByIdForRole', appointmentId, userId, role);
    const cached = this.cache.get<IAppointment | null>(k);
    if (cached) return cached;
    const res = await this.repo.findByIdForRole(appointmentId, userId, role);
    this.cache.set(k, res, this.ttlMs);
    return res;
  }

  async findConflict(vetId: string, date: Date, time: string, excludeId?: string): Promise<IAppointment | null> {
    // Conflicts change often; skip caching to be safe
    return this.repo.findConflict(vetId, date, time, excludeId);
  }

  async create(data: Partial<IAppointment>): Promise<IAppointment> {
    const res = await this.repo.create(data);
    // invalidate common caches
    this.cache.del(this.key('findByUser', res.user.toString()));
    this.cache.del(this.key('findByVeterinarian', res.veterinarian.toString()));
    return res;
  }

  async updateById(id: string, patch: Partial<IAppointment>): Promise<IAppointment | null> {
    const res = await this.repo.updateById(id, patch);
    return res;
  }
}