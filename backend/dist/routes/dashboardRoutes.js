"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const DashboardController_1 = __importDefault(require("../controllers/DashboardController"));
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', DashboardController_1.default.getDashboard.bind(DashboardController_1.default));
router.get('/summary', DashboardController_1.default.getDashboardSummary.bind(DashboardController_1.default));
router.get('/notifications', DashboardController_1.default.getNotifications.bind(DashboardController_1.default));
router.get('/my', DashboardController_1.default.getMyDashboard.bind(DashboardController_1.default));
router.get('/range', DashboardController_1.default.getDashboardByDateRange.bind(DashboardController_1.default));
router.put('/notifications/:notificationId/read', DashboardController_1.default.markNotificationRead.bind(DashboardController_1.default));
router.get('/user/:userId', DashboardController_1.default.getUserDashboard.bind(DashboardController_1.default));
router.get('/veterinarian/:vetId', DashboardController_1.default.getVeterinarianDashboard.bind(DashboardController_1.default));
router.get('/admin', (0, auth_1.authorize)('admin'), DashboardController_1.default.getAdminDashboard.bind(DashboardController_1.default));
router.get('/admin/health', (0, auth_1.authorize)('admin'), DashboardController_1.default.getSystemHealth.bind(DashboardController_1.default));
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map