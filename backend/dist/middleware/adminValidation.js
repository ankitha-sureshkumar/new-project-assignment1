"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVeterinarianAction = exports.validateUserAction = exports.validateAdminLogin = void 0;
const express_validator_1 = require("express-validator");
exports.validateAdminLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
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
exports.validateUserAction = [
    (0, express_validator_1.body)('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),
    (0, express_validator_1.body)('action')
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['block', 'unblock', 'delete'])
        .withMessage('Invalid action. Must be block, unblock, or delete'),
    (0, express_validator_1.body)('reason')
        .if((0, express_validator_1.body)('action').equals('block'))
        .notEmpty()
        .withMessage('Reason is required for blocking a user'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
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
exports.validateVeterinarianAction = [
    (0, express_validator_1.body)('veterinarianId')
        .notEmpty()
        .withMessage('Veterinarian ID is required')
        .isMongoId()
        .withMessage('Invalid veterinarian ID format'),
    (0, express_validator_1.body)('action')
        .notEmpty()
        .withMessage('Action is required')
        .isIn(['approve', 'reject', 'block', 'unblock', 'delete'])
        .withMessage('Invalid action. Must be approve, reject, block, unblock, or delete'),
    (0, express_validator_1.body)('reason')
        .if((0, express_validator_1.body)('action').isIn(['reject', 'block']))
        .notEmpty()
        .withMessage('Reason is required for rejecting or blocking a veterinarian'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
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
//# sourceMappingURL=adminValidation.js.map