import express from 'express';
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getAllVeterinarians,
  updateUser,
  updateVeterinarian,
  performUserAction,
  performVeterinarianAction,
  getSystemHealth
} from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/adminAuth';
import { validateAdminLogin, validateUserAction, validateVeterinarianAction } from '../middleware/adminValidation';

const router = express.Router();

// Admin authentication (no middleware required)
router.post('/login', validateAdminLogin, adminLogin);

// Protected admin routes (require authentication)
router.get('/dashboard', authenticateAdmin, getDashboardStats);
router.get('/dashboard/stats', authenticateAdmin, getDashboardStats);

// User management
router.get('/users', authenticateAdmin, getAllUsers);
router.put('/users/:userId', authenticateAdmin, updateUser);
router.post('/users/action', authenticateAdmin, validateUserAction, performUserAction);

// Veterinarian management
router.get('/veterinarians', authenticateAdmin, getAllVeterinarians);
router.put('/veterinarians/:veterinarianId', authenticateAdmin, updateVeterinarian);
router.post('/veterinarians/action', authenticateAdmin, validateVeterinarianAction, performVeterinarianAction);

// System monitoring
router.get('/system/health', authenticateAdmin, getSystemHealth);

export default router;
