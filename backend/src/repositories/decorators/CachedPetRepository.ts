import { PetRepository, IPetRepository } from '../PetRepository';
import { CacheService } from '../../patterns/decorator/CacheService';

export class CachedPetRepository implements IPetRepository {
  private cache = CacheService.getInstance();
  private ttlMs = 60 * 1000; // 1 minute
  private repo: PetRepository;
  constructor(repo?: PetRepository) { this.repo = repo || new PetRepository(); }
  private key(...parts: any[]): string { return ['petRepo', ...parts].join(':'); }

  async listByOwner(ownerId: string): Promise<any[]> {
    const k = this.key('listByOwner', ownerId);
    const cached = this.cache.get<any[]>(k);
    if (cached) return cached;
    const res = await this.repo.listByOwner(ownerId);
    this.cache.set(k, res, this.ttlMs);
    return res;
  }
}