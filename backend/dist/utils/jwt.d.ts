import { IUser } from '../models/User';
import { IVeterinarian } from '../models/Veterinarian';
import { IAdmin } from '../models/Admin';
export interface JWTPayload {
    userId?: string;
    id?: string;
    email?: string;
    role: 'user' | 'veterinarian' | 'admin';
}
type AuthUser = IUser | IVeterinarian | IAdmin;
export declare function generateToken(user: AuthUser): string;
export declare function generateToken(id: string, role: 'admin'): string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
};
export {};
//# sourceMappingURL=jwt.d.ts.map