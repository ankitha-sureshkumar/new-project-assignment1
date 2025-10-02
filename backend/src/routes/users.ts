import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import {
  userRegisterValidation,
  loginValidation,
} from '../middleware/validation';
import { uploadProfilePicture } from '../middleware/upload';

const router = Router();

// Public routes
/**
 * @route   POST /api/users/register
 * @desc    Register a new user (pet parent)
 * @access  Public
 */
router.post('/register', uploadProfilePicture, userRegisterValidation, registerUser);

/**
 * @route   POST /api/users/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', loginValidation, loginUser);

// Protected routes (require authentication)
/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticate, uploadProfilePicture, updateUserProfile);

export default router;