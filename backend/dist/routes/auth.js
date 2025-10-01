"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', validation_1.registerValidation, authController_1.register);
router.post('/login', validation_1.loginValidation, authController_1.login);
router.get('/veterinarians', auth_1.optionalAuth, authController_1.getVeterinarians);
router.get('/veterinarians/:id', (0, validation_1.objectIdValidation)('id'), authController_1.getVeterinarianById);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
router.put('/profile', auth_1.authenticate, validation_1.updateProfileValidation, authController_1.updateProfile);
router.put('/change-password', auth_1.authenticate, validation_1.changePasswordValidation, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map