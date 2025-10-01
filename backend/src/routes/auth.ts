import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getVeterinarians,
  getVeterinarianById
} from '../controllers/authController';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  objectIdValidation
} from '../middleware/validation';

const router = Router();

// Public routes
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (pet parent or veterinarian)
 * @access  Public
 */
router.post('/register', registerValidation, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', loginValidation, login);

/**
 * @route   GET /api/auth/veterinarians
 * @desc    Get all veterinarians (for appointment booking)
 * @query   ?specialization=Surgery&available=true
 * @access  Public
 */
router.get('/veterinarians', optionalAuth, getVeterinarians);

/**
 * @route   GET /api/auth/veterinarians/:id
 * @desc    Get veterinarian by ID
 * @access  Public
 */
router.get('/veterinarians/:id', objectIdValidation('id'), getVeterinarianById);

// Protected routes (require authentication)
/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, updateProfileValidation, updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

export default router;