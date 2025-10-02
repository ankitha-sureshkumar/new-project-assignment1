"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.post('/register', upload_1.uploadProfilePicture, validation_1.userRegisterValidation, userController_1.registerUser);
router.post('/login', validation_1.loginValidation, userController_1.loginUser);
router.get('/profile', auth_1.authenticate, userController_1.getUserProfile);
router.put('/profile', auth_1.authenticate, upload_1.uploadProfilePicture, userController_1.updateUserProfile);
exports.default = router;
//# sourceMappingURL=users.js.map