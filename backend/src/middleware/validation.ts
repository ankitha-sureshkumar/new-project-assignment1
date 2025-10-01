import { body, param } from 'express-validator';

// Registration validation
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('role')
    .isIn(['user', 'veterinarian'])
    .withMessage('Role must be either user or veterinarian'),

  body('contact')
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact number'),

  // Conditional validation for user role
  body('address')
    .if(body('role').equals('user'))
    .notEmpty()
    .withMessage('Address is required for users')
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  // Conditional validation for veterinarian role
  body('specialization')
    .if(body('role').equals('veterinarian'))
    .isIn([
      'General Practice',
      'Surgery', 
      'Dental Care',
      'Emergency Care',
      'Dermatology',
      'Cardiology',
      'Orthopedics'
    ])
    .withMessage('Please select a valid specialization'),

  body('experience')
    .if(body('role').equals('veterinarian'))
    .notEmpty()
    .withMessage('Experience is required for veterinarians')
    .isLength({ max: 100 })
    .withMessage('Experience description cannot exceed 100 characters'),

  body('consultationFeeRange.min')
    .if(body('role').equals('veterinarian'))
    .isNumeric()
    .withMessage('Minimum consultation fee must be a number')
    .custom((value) => {
      if (value < 10) {
        throw new Error('Minimum consultation fee must be at least $10');
      }
      return true;
    }),

  body('consultationFeeRange.max')
    .if(body('role').equals('veterinarian'))
    .isNumeric()
    .withMessage('Maximum consultation fee must be a number')
    .custom((value, { req }) => {
      const minFee = req.body.consultationFeeRange?.min;
      if (minFee && value <= minFee) {
        throw new Error('Maximum fee must be greater than minimum fee');
      }
      return true;
    })
];

// Login validation
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Profile update validation
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('contact')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact number'),

  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('specialization')
    .optional()
    .isIn([
      'General Practice',
      'Surgery',
      'Dental Care', 
      'Emergency Care',
      'Dermatology',
      'Cardiology',
      'Orthopedics'
    ])
    .withMessage('Please select a valid specialization'),

  body('experience')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Experience description cannot exceed 100 characters'),

  body('consultationFeeRange.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum consultation fee must be a number')
    .custom((value) => {
      if (value < 10) {
        throw new Error('Minimum consultation fee must be at least $10');
      }
      return true;
    }),

  body('consultationFeeRange.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum consultation fee must be a number')
    .custom((value, { req }) => {
      const minFee = req.body.consultationFeeRange?.min;
      if (minFee && value <= minFee) {
        throw new Error('Maximum fee must be greater than minimum fee');
      }
      return true;
    }),

  // Availability validation for veterinarians
  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),

  body('availability.*.day')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day name'),

  body('availability.*.startTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),

  body('availability.*.endTime')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),

  body('availability.*.enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean value')
];

// Change password validation
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];

// Pet validation
export const petValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Pet name must be between 1 and 30 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Pet name can only contain letters and spaces'),

  body('type')
    .isIn(['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'])
    .withMessage('Pet type must be Dog, Cat, Bird, Rabbit, or Other'),

  body('breed')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Breed must be between 1 and 50 characters'),

  body('age')
    .trim()
    .notEmpty()
    .withMessage('Age is required'),

  body('weight')
    .optional()
    .isNumeric()
    .withMessage('Weight must be a number')
    .custom((value) => {
      if (value < 0.1 || value > 200) {
        throw new Error('Weight must be between 0.1 and 200 kg');
      }
      return true;
    }),

  body('medicalHistory')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Medical history cannot exceed 1000 characters'),

  body('vaccinations')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Vaccinations info cannot exceed 500 characters'),

  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),

  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Emergency contact name must be between 2 and 50 characters'),

  body('emergencyContact.contact')
    .optional()
    .isMobilePhone('any')
    .withMessage('Emergency contact must be a valid phone number'),

  body('emergencyContact.relation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Relation must be between 2 and 30 characters')
];

// Appointment validation
export const appointmentValidation = [
  body('veterinarian')
    .isMongoId()
    .withMessage('Invalid veterinarian ID'),

  body('pet')
    .isMongoId()
    .withMessage('Invalid pet ID'),

  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Invalid date format')
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        throw new Error('Appointment date must be in the future');
      }
      return true;
    }),

  body('time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),

  body('reason')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),

  body('comments')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters')
];

// Consultation fee validation (for veterinarians)
export const consultationFeeValidation = [
  body('consultationFee')
    .isNumeric()
    .withMessage('Consultation fee must be a number')
    .custom((value) => {
      if (value < 0 || value > 10000) {
        throw new Error('Consultation fee must be between $0 and $10,000');
      }
      return true;
    })
];

// MongoDB ObjectId validation
export const objectIdValidation = (field: string = 'id') => [
  param(field)
    .isMongoId()
    .withMessage(`Invalid ${field}`)
];

// Rating validation
export const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters')
];

// User registration validation (separate from veterinarian)
export const userRegisterValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('contact')
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact number'),

  body('address')
    .notEmpty()
    .withMessage('Address is required for users')
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('petOwnership')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Pet ownership information cannot exceed 500 characters'),

  body('preferredContact')
    .optional()
    .isIn(['email', 'phone', 'both'])
    .withMessage('Preferred contact must be email, phone, or both')
];

// Veterinarian registration validation (separate from user)
export const veterinarianRegisterValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  body('contact')
    .isMobilePhone('any')
    .withMessage('Please provide a valid contact number'),

  body('specialization')
    .isIn([
      'General Practice',
      'Surgery', 
      'Dental Care',
      'Emergency Care',
      'Dermatology',
      'Cardiology',
      'Orthopedics'
    ])
    .withMessage('Please select a valid specialization'),

  body('experience')
    .notEmpty()
    .withMessage('Experience is required for veterinarians')
    .isLength({ max: 100 })
    .withMessage('Experience description cannot exceed 100 characters'),

  body('consultationFeeRange.min')
    .isNumeric()
    .withMessage('Minimum consultation fee must be a number')
    .custom((value) => {
      if (value < 10) {
        throw new Error('Minimum consultation fee must be at least $10');
      }
      return true;
    }),

  body('consultationFeeRange.max')
    .isNumeric()
    .withMessage('Maximum consultation fee must be a number')
    .custom((value, { req }) => {
      const minFee = req.body.consultationFeeRange?.min;
      if (minFee && value <= minFee) {
        throw new Error('Maximum fee must be greater than minimum fee');
      }
      return true;
    }),

  body('hospitalsServed')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Hospitals served information cannot exceed 500 characters'),

  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array')
];
