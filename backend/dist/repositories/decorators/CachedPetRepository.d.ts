import { PetRepository, IPetRepository } from '../PetRepository';
export declare class CachedPetRepository implements IPetRepository {
    private cache;
    private ttlMs;
    private repo;
    constructor(repo?: PetRepository);
    private key;
    listByOwner(ownerId: string): Promise<any[]>;
}
//# sourceMappingURL=CachedPetRepository.d.ts.map