"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityController = void 0;
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
const mongoose_1 = __importDefault(require("mongoose"));
class AvailabilityController {
    async getMyAvailability(req, res) {
        try {
            const veterinarianId = req.userId;
            if (!veterinarianId) {
                res.status(401).json({
                    success: false,
                    message: 'Veterinarian authentication required'
                });
                return;
            }
            const veterinarian = await Veterinarian_1.default.findById(veterinarianId).select('availability');
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            res.json({
                success: true,
                data: { availability: veterinarian.availability }
            });
        }
        catch (error) {
            console.error('Get availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get availability'
            });
        }
    }
    async updateAvailability(req, res) {
        try {
            const veterinarianId = req.userId;
            const { availability } = req.body;
            if (!veterinarianId) {
                res.status(401).json({
                    success: false,
                    message: 'Veterinarian authentication required'
                });
                return;
            }
            if (!availability || !Array.isArray(availability)) {
                res.status(400).json({
                    success: false,
                    message: 'Valid availability array is required'
                });
                return;
            }
            const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            for (const slot of availability) {
                if (!validDays.includes(slot.day)) {
                    res.status(400).json({
                        success: false,
                        message: `Invalid day: ${slot.day}`
                    });
                    return;
                }
                if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid time format. Use HH:MM format'
                    });
                    return;
                }
                if (typeof slot.enabled !== 'boolean') {
                    res.status(400).json({
                        success: false,
                        message: 'Enabled field must be boolean'
                    });
                    return;
                }
            }
            const veterinarian = await Veterinarian_1.default.findByIdAndUpdate(veterinarianId, { availability }, { new: true, runValidators: true }).select('availability');
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Availability updated successfully',
                data: { availability: veterinarian.availability }
            });
        }
        catch (error) {
            console.error('Update availability error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update availability'
            });
        }
    }
    async toggleTimeSlot(req, res) {
        try {
            const veterinarianId = req.userId;
            const { day, enabled } = req.body;
            if (!veterinarianId) {
                res.status(401).json({
                    success: false,
                    message: 'Veterinarian authentication required'
                });
                return;
            }
            const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            if (!validDays.includes(day)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid day provided'
                });
                return;
            }
            if (typeof enabled !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'Enabled field must be boolean'
                });
                return;
            }
            const veterinarian = await Veterinarian_1.default.findById(veterinarianId);
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            const dayIndex = veterinarian.availability.findIndex(slot => slot.day === day);
            if (dayIndex !== -1) {
                veterinarian.availability[dayIndex].enabled = enabled;
                await veterinarian.save();
            }
            else {
                res.status(404).json({
                    success: false,
                    message: 'Time slot for the specified day not found'
                });
                return;
            }
            res.json({
                success: true,
                message: `${day} availability ${enabled ? 'enabled' : 'disabled'}`,
                data: { availability: veterinarian.availability }
            });
        }
        catch (error) {
            console.error('Toggle time slot error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to toggle time slot'
            });
        }
    }
    async getAvailableSlots(req, res) {
        try {
            const { veterinarianId } = req.params;
            const { date } = req.query;
            if (!mongoose_1.default.Types.ObjectId.isValid(veterinarianId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid veterinarian ID'
                });
                return;
            }
            if (!date) {
                res.status(400).json({
                    success: false,
                    message: 'Date parameter is required'
                });
                return;
            }
            const requestedDate = new Date(date);
            const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
            const veterinarian = await Veterinarian_1.default.findById(veterinarianId).select('availability');
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            const dayAvailability = veterinarian.availability.find(slot => slot.day === dayName);
            if (!dayAvailability || !dayAvailability.enabled) {
                res.json({
                    success: true,
                    data: { availableSlots: [] },
                    message: 'No availability for this day'
                });
                return;
            }
            const startTime = dayAvailability.startTime;
            const endTime = dayAvailability.endTime;
            const slots = this.generateTimeSlots(startTime, endTime, 30);
            res.json({
                success: true,
                data: {
                    availableSlots: slots.map(slot => ({
                        time: slot,
                        available: true
                    }))
                }
            });
        }
        catch (error) {
            console.error('Get available slots error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get available slots'
            });
        }
    }
    generateTimeSlots(startTime, endTime, intervalMinutes) {
        const slots = [];
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }
        return slots;
    }
}
exports.AvailabilityController = AvailabilityController;
const availabilityController = new AvailabilityController();
exports.default = availabilityController;
//# sourceMappingURL=AvailabilityController.js.map