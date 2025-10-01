import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
import { IVeterinarian } from '../models/Veterinarian';
declare global {
    namespace Express {
        interface Request {
            user?: IUser | IVeterinarian;
            userId?: string;
            userRole?: 'user' | 'veterinarian' | 'admin';
        }
    }
}
export interface AuthRequest extends Request {
    user?: IUser | IVeterinarian;
    userId?: string;
    userRole?: 'user' | 'veterinarian' | 'admin';
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: ("user" | "veterinarian" | "admin")[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const checkResourceOwnership: (resourceIdParam?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map