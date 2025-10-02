"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const AppointmentController_1 = __importDefault(require("../controllers/AppointmentController"));
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)('user'), AppointmentController_1.default.bookAppointment.bind(AppointmentController_1.default));
router.get('/', AppointmentController_1.default.getMyAppointments.bind(AppointmentController_1.default));
router.get('/all', (0, auth_1.authorize)('admin'), AppointmentController_1.default.getAllAppointments.bind(AppointmentController_1.default));
router.get('/:appointmentId', AppointmentController_1.default.getAppointmentById.bind(AppointmentController_1.default));
router.put('/:appointmentId/approve', (0, auth_1.authorize)('veterinarian', 'admin'), AppointmentController_1.default.approveAppointment.bind(AppointmentController_1.default));
router.put('/:appointmentId/confirm', AppointmentController_1.default.confirmAppointment.bind(AppointmentController_1.default));
router.put('/:appointmentId/complete', (0, auth_1.authorize)('veterinarian', 'admin'), AppointmentController_1.default.completeAppointment.bind(AppointmentController_1.default));
router.put('/:appointmentId/cancel', AppointmentController_1.default.cancelAppointment.bind(AppointmentController_1.default));
router.put('/:appointmentId/reject', (0, auth_1.authorize)('veterinarian', 'admin'), AppointmentController_1.default.rejectAppointment.bind(AppointmentController_1.default));
router.post('/:appointmentId/rating', AppointmentController_1.default.rateAppointment.bind(AppointmentController_1.default));
router.put('/:appointmentId/reschedule', AppointmentController_1.default.rescheduleAppointment.bind(AppointmentController_1.default));
router.get('/stats/summary', (0, auth_1.authorize)('veterinarian', 'admin'), AppointmentController_1.default.getAppointmentStats.bind(AppointmentController_1.default));
exports.default = router;
//# sourceMappingURL=appointmentRoutes.js.map