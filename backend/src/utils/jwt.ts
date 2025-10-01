import jwt, { SignOptions } from 'jsonwebtoken';
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

// Overloaded function for user/veterinarian
export function generateToken(user: AuthUser): string;
// Overloaded function for admin with explicit id and role
export function generateToken(id: string, role: 'admin'): string;
export function generateToken(userOrId: AuthUser | string, role?: 'admin'): string {
  let payload: JWTPayload;
  
  if (typeof userOrId === 'string' && role === 'admin') {
    // Admin token generation
    payload = {
      id: userOrId,
      role: 'admin'
    };
  } else {
    // User/Veterinarian token generation
    const user = userOrId as AuthUser;
    const userRole = 'address' in user ? 'user' : 'permissions' in user ? 'admin' : 'veterinarian';
    
    payload = {
      userId: user._id?.toString() || '',
      email: user.email,
      role: userRole as 'user' | 'veterinarian' | 'admin'
    };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const options: any = {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    issuer: 'oggy-pet-hospital',
    audience: 'oggy-pet-hospital-users'
  };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, secret, {
      issuer: 'oggy-pet-hospital',
      audience: 'oggy-pet-hospital-users'
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  const options: any = {
    expiresIn: '30d',
    issuer: 'oggy-pet-hospital',
    audience: 'oggy-pet-hospital-refresh'
  };

  return jwt.sign({ userId }, secret, options);
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    return jwt.verify(token, secret, {
      issuer: 'oggy-pet-hospital',
      audience: 'oggy-pet-hospital-refresh'
    }) as { userId: string };
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};