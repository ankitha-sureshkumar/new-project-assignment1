import { IUserRepository, UserRepository } from '../UserRepository';
import { IUser } from '../../models/User';
export declare class CachedUserRepository implements IUserRepository {
    private cache;
    private ttlMs;
    private repo;
    constructor(repo?: UserRepository);
    private key;
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    list(limit?: number): Promise<IUser[]>;
}
//# sourceMappingURL=CachedUserRepository.d.ts.map