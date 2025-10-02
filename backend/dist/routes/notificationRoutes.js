"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const NotificationController_1 = __importDefault(require("../controllers/NotificationController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', NotificationController_1.default.getUserNotifications);
router.put('/:notificationId/read', NotificationController_1.default.markNotificationAsRead);
router.put('/mark-all-read', NotificationController_1.default.markAllNotificationsAsRead);
router.get('/unread-count', NotificationController_1.default.getUnreadCount);
router.delete('/:notificationId', NotificationController_1.default.deleteNotification);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map