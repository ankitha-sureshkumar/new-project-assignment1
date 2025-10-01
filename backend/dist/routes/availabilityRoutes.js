"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AvailabilityController_1 = __importDefault(require("../controllers/AvailabilityController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/my-schedule', (0, auth_1.authorize)('veterinarian'), AvailabilityController_1.default.getMyAvailability.bind(AvailabilityController_1.default));
router.put('/update-schedule', (0, auth_1.authorize)('veterinarian'), AvailabilityController_1.default.updateAvailability.bind(AvailabilityController_1.default));
router.put('/toggle-slot', (0, auth_1.authorize)('veterinarian'), AvailabilityController_1.default.toggleTimeSlot.bind(AvailabilityController_1.default));
router.get('/:veterinarianId/slots', AvailabilityController_1.default.getAvailableSlots.bind(AvailabilityController_1.default));
exports.default = router;
//# sourceMappingURL=availabilityRoutes.js.map