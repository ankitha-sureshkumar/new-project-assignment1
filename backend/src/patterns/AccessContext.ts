import { AuthRequest } from '../middleware/auth';
import { UserContext, Permission } from './AccessProxy';

export function buildUserContext(req: AuthRequest): UserContext {
  const role = req.userRole || 'user';
  const isBlocked = (req.user as any)?.isBlocked || false;
  const isApproved = (req.user as any)?.isApproved || false;

  // Basic permission mapping (can be expanded)
  const base: Permission[] = [];
  if (role === 'user') {
    base.push(
      Permission.READ_OWN_DATA,
      Permission.WRITE_OWN_DATA,
      Permission.DELETE_OWN_DATA
    );
  }
  if (role === 'veterinarian') {
    base.push(
      Permission.READ_ALL_DATA,
      Permission.ACCESS_MEDICAL_RECORDS,
      Permission.APPROVE_APPOINTMENTS
    );
  }
  if (role === 'admin') {
    base.push(
      Permission.READ_ALL_DATA,
      Permission.WRITE_ALL_DATA,
      Permission.DELETE_ALL_DATA,
      Permission.MANAGE_USERS,
      Permission.MANAGE_VETERINARIANS,
      Permission.VIEW_SENSITIVE_DATA
    );
  }

  return {
    userId: req.userId || '',
    role,
    permissions: base,
    isBlocked,
    isApproved
  };
}