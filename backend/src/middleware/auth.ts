import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import User, { IUser } from '../models/User';
import Veterinarian, { IVeterinarian } from '../models/Veterinarian';

// Extend Request interface to include user data
declare global {
  namespace Express {
    interface Request {
      user?: IUser | IVeterinarian;
      userId?: string;
      userRole?: 'user' | 'veterinarian' | 'admin';
    }
  }
}

// Export AuthRequest interface for TypeScript typing
export interface AuthRequest extends Request {
  user?: IUser | IVeterinarian;
  userId?: string;
  userRole?: 'user' | 'veterinarian' | 'admin';
}

export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return;
    }

    // Verify the token
    const payload: JWTPayload = verifyToken(token);
    
    // Get user from database based on role
    let user: IUser | IVeterinarian | null = null;
    
    if (payload.role === 'user') {
      user = await User.findById(payload.userId).select('-password');
    } else if (payload.role === 'veterinarian') {
      user = await Veterinarian.findById(payload.userId).select('-password');
    }
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
      return;
    }

    // Add user info to request object
    req.user = user;
    req.userId = user._id?.toString() || '';
    req.userRole = payload.role;
    
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid token.'
    });
  }
};

// Middleware to authorize specific roles
export const authorize = (...roles: ('user' | 'veterinarian' | 'admin')[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole) {
      res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
      return;
    }

    if (!roles.includes(req.userRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
      return;
    }

    next();
  };
};

// Middleware to check if user owns the resource (for users only)
export const checkResourceOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.userId;
      const userRole = req.userRole;

      // Veterinarians can access all resources for their appointments
      if (userRole === 'veterinarian') {
        next();
        return;
      }

      // For users, check if they own the resource
      if (!resourceId || !userId) {
        res.status(400).json({
          success: false,
          message: 'Missing resource ID or user ID.'
        });
        return;
      }

      // This middleware assumes the resource ID matches the user ID
      // For more complex ownership checks, this would need to query the database
      if (resourceId !== userId) {
        res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error during authorization check.'
      });
    }
  };
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      if (token) {
        try {
          const payload: JWTPayload = verifyToken(token);
          let user: IUser | IVeterinarian | null = null;
          
          if (payload.role === 'user') {
            user = await User.findById(payload.userId).select('-password');
          } else if (payload.role === 'veterinarian') {
            user = await Veterinarian.findById(payload.userId).select('-password');
          }
          
          if (user) {
            req.user = user;
            req.userId = user._id?.toString() || '';
            req.userRole = payload.role;
          }
        } catch (error) {
          // Ignore token errors for optional auth
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

// Export alias for backward compatibility
export const authenticateToken = authenticate;
