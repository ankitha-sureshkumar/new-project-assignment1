import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// Admin login validation
export const validateAdminLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  (req: Request, res: Response, next: NextFunction): void | Response => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// User action validation
export const validateUserAction = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),

  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['block', 'unblock', 'delete'])
    .withMessage('Invalid action. Must be block, unblock, or delete'),

  body('reason')
    .if(body('action').equals('block'))
    .notEmpty()
    .withMessage('Reason is required for blocking a user'),

  (req: Request, res: Response, next: NextFunction): void | Response => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Veterinarian action validation
export const validateVeterinarianAction = [
  body('veterinarianId')
    .notEmpty()
    .withMessage('Veterinarian ID is required')
    .isMongoId()
    .withMessage('Invalid veterinarian ID format'),

  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['approve', 'reject', 'block', 'unblock', 'delete'])
    .withMessage('Invalid action. Must be approve, reject, block, unblock, or delete'),

  body('reason')
    .if(body('action').isIn(['reject', 'block']))
    .notEmpty()
    .withMessage('Reason is required for rejecting or blocking a veterinarian'),

  (req: Request, res: Response, next: NextFunction): void | Response => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];