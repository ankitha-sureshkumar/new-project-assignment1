import { Request } from 'express';
export interface AuthUser {
    userId?: string;
    id?: string;
    email: string;
    role: 'user' | 'veterinarian' | 'admin';
}
export interface AuthRequest extends Request {
    user?: AuthUser;
}
export interface AuthResponse {
    token: string;
    user: any;
    refreshToken?: string;
}
export interface AdminAuthUser {
    adminId?: string;
    id?: string;
    email: string;
    role: 'admin';
}
export interface AdminAuthRequest extends Request {
    admin?: AdminAuthUser;
}
//# sourceMappingURL=auth.d.ts.map