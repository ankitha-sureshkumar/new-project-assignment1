"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const veterinarianController_1 = require("../controllers/veterinarianController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/register', upload_1.uploadMultiple, validation_1.veterinarianRegisterValidation, veterinarianController_1.registerVeterinarian);
router.post('/login', validation_1.loginValidation, veterinarianController_1.loginVeterinarian);
router.get('/', auth_1.optionalAuth, veterinarianController_1.getVeterinarians);
router.get('/:id', (0, validation_1.objectIdValidation)('id'), veterinarianController_1.getVeterinarianById);
router.get('/profile', auth_1.authenticate, veterinarianController_1.getVeterinarianProfile);
router.put('/profile', auth_1.authenticate, upload_1.uploadMultiple, veterinarianController_1.updateVeterinarianProfile);
exports.default = router;
//# sourceMappingURL=veterinarians.js.map