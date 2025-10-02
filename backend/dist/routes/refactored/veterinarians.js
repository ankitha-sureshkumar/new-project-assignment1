"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VeterinarianController_1 = require("../../controllers/refactored/VeterinarianController");
const auth_1 = require("../../middleware/auth");
const validation_1 = require("../../middleware/validation");
const upload_1 = require("../../middleware/upload");
const router = (0, express_1.Router)();
router.post('/register', upload_1.uploadMultiple, validation_1.veterinarianRegisterValidation, VeterinarianController_1.registerVeterinarian);
router.post('/login', validation_1.loginValidation, VeterinarianController_1.loginVeterinarian);
router.get('/', VeterinarianController_1.getAllVeterinarians);
router.get('/profile', auth_1.authenticate, VeterinarianController_1.getVeterinarianProfile);
router.put('/profile', auth_1.authenticate, upload_1.uploadMultiple, validation_1.updateProfileValidation, VeterinarianController_1.updateVeterinarianProfile);
router.get('/dashboard', auth_1.authenticate, VeterinarianController_1.getVeterinarianDashboard);
exports.default = router;
//# sourceMappingURL=veterinarians.js.map