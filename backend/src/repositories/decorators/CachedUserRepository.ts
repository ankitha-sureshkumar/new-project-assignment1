import { IUserRepository, UserRepository } from '../UserRepository';
import { IUser } from '../../models/User';
import { CacheService } from '../../patterns/decorator/CacheService';

export class CachedUserRepository implements IUserRepository {
  private cache = CacheService.getInstance();
  private ttlMs = 60 * 1000; // 1 minute
  private repo: UserRepository;
  constructor(repo?: UserRepository) { this.repo = repo || new UserRepository(); }
  private key(...parts: any[]): string { return ['userRepo', ...parts].join(':'); }

  async findById(id: string): Promise<IUser | null> {
    const k = this.key('findById', id);
    const cached = this.cache.get<IUser | null>(k);
    if (cached) return cached;
    const res = await this.repo.findById(id);
    this.cache.set(k, res, this.ttlMs);
    return res;
  }
  async findByEmail(email: string): Promise<IUser | null> { return this.repo.findByEmail(email); }
  async list(limit?: number): Promise<IUser[]> { return this.repo.list(limit); }
}