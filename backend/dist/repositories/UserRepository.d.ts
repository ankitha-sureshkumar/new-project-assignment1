import { IUser } from '../models/User';
export interface IUserRepository {
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    list(limit?: number): Promise<IUser[]>;
}
export declare class UserRepository implements IUserRepository {
    findById(id: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    list(limit?: number): Promise<IUser[]>;
}
//# sourceMappingURL=UserRepository.d.ts.map