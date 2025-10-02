import { Router } from 'express';
import {
  registerVeterinarian,
  loginVeterinarian,
  getVeterinarians,
  getVeterinarianById,
  getVeterinarianProfile,
  updateVeterinarianProfile
} from '../controllers/veterinarianController';
import { authenticate, optionalAuth } from '../middleware/auth';
import {
  veterinarianRegisterValidation,
  loginValidation,
  objectIdValidation
} from '../middleware/validation';
import { uploadMultiple } from '../middleware/upload';

const router = Router();

// Public routes
/**
 * @route   POST /api/veterinarians/register
 * @desc    Register a new veterinarian
 * @access  Public
 */
router.post('/register', uploadMultiple, veterinarianRegisterValidation, registerVeterinarian);

/**
 * @route   POST /api/veterinarians/login
 * @desc    Login veterinarian and get token
 * @access  Public
 */
router.post('/login', loginValidation, loginVeterinarian);

/**
 * @route   GET /api/veterinarians
 * @desc    Get all veterinarians (for appointment booking)
 * @query   ?specialization=Surgery&available=true
 * @access  Public
 */
router.get('/', optionalAuth, getVeterinarians);

/**
 * @route   GET /api/veterinarians/:id
 * @desc    Get veterinarian by ID
 * @access  Public
 */
router.get('/:id', objectIdValidation('id'), getVeterinarianById);

// Protected routes (require authentication)
/**
 * @route   GET /api/veterinarians/profile
 * @desc    Get current veterinarian profile
 * @access  Private
 */
router.get('/profile', authenticate, getVeterinarianProfile);

/**
 * @route   PUT /api/veterinarians/profile
 * @desc    Update veterinarian profile
 * @access  Private
 */
router.put('/profile', authenticate, uploadMultiple, updateVeterinarianProfile);

export default router;