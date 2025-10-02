"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const adminAuth_1 = require("../middleware/adminAuth");
const adminValidation_1 = require("../middleware/adminValidation");
const router = express_1.default.Router();
router.post('/login', adminValidation_1.validateAdminLogin, adminController_1.adminLogin);
router.get('/dashboard', adminAuth_1.authenticateAdmin, adminController_1.getDashboardStats);
router.get('/dashboard/stats', adminAuth_1.authenticateAdmin, adminController_1.getDashboardStats);
router.get('/users', adminAuth_1.authenticateAdmin, adminController_1.getAllUsers);
router.put('/users/:userId', adminAuth_1.authenticateAdmin, adminController_1.updateUser);
router.post('/users/action', adminAuth_1.authenticateAdmin, adminValidation_1.validateUserAction, adminController_1.performUserAction);
router.get('/veterinarians', adminAuth_1.authenticateAdmin, adminController_1.getAllVeterinarians);
router.put('/veterinarians/:veterinarianId', adminAuth_1.authenticateAdmin, adminController_1.updateVeterinarian);
router.post('/veterinarians/action', adminAuth_1.authenticateAdmin, adminValidation_1.validateVeterinarianAction, adminController_1.performVeterinarianAction);
router.get('/system/health', adminAuth_1.authenticateAdmin, adminController_1.getSystemHealth);
exports.default = router;
//# sourceMappingURL=admin.js.map