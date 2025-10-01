"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const Appointment_1 = __importDefault(require("../models/Appointment"));
const Pet_1 = __importDefault(require("../models/Pet"));
const Veterinarian_1 = __importDefault(require("../models/Veterinarian"));
const mongoose_1 = __importDefault(require("mongoose"));
const NotificationObserver_1 = require("../patterns/NotificationObserver");
class AppointmentController {
    constructor() {
        this.notificationManager = new NotificationObserver_1.NotificationManager();
    }
    async bookAppointment(req, res) {
        try {
            const userId = req.user?._id;
            const { petId, veterinarianId, date, timeSlot, reason, userNotes } = req.body;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }
            if (!petId || !veterinarianId || !date || !timeSlot || !reason) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: petId, veterinarianId, date, timeSlot, reason are required'
                });
                return;
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(petId) ||
                !mongoose_1.default.Types.ObjectId.isValid(veterinarianId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid pet or veterinarian ID'
                });
                return;
            }
            const pet = await Pet_1.default.findOne({ _id: petId, owner: userId, isActive: true });
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found or does not belong to you'
                });
                return;
            }
            const veterinarian = await Veterinarian_1.default.findOne({ _id: veterinarianId, isApproved: true });
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found or not available'
                });
                return;
            }
            const existingAppointment = await Appointment_1.default.findOne({
                veterinarian: veterinarianId,
                date: new Date(date),
                time: timeSlot.startTime,
                status: { $nin: ['CANCELLED', 'REJECTED'] }
            });
            if (existingAppointment) {
                res.status(409).json({
                    success: false,
                    message: 'Time slot is already booked. Please choose another time.'
                });
                return;
            }
            const appointmentData = {
                user: userId,
                pet: petId,
                veterinarian: veterinarianId,
                date: new Date(date),
                time: timeSlot.startTime,
                reason: reason.trim(),
                comments: userNotes?.trim(),
                status: 'PENDING'
            };
            const appointment = new Appointment_1.default(appointmentData);
            await appointment.save();
            await appointment.populate([
                { path: 'user', select: 'name email contact' },
                { path: 'pet', select: 'name type breed age weight' },
                { path: 'veterinarian', select: 'name email specialization' }
            ]);
            await this.notificationManager.onAppointmentCreated(appointment);
            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully! The veterinarian will review your request.',
                data: { appointment }
            });
        }
        catch (error) {
            console.error('Book appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to book appointment. Please try again.',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    async getMyAppointments(req, res) {
        try {
            const userId = req.user?._id;
            const userRole = req.userRole;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
                return;
            }
            let appointments;
            if (userRole === 'veterinarian') {
                appointments = await Appointment_1.default.find({ veterinarian: userId })
                    .populate('user', 'name email contact')
                    .populate('pet', 'name type breed age weight')
                    .populate('veterinarian', 'name email specialization')
                    .sort({ date: -1 });
            }
            else {
                appointments = await Appointment_1.default.find({ user: userId })
                    .populate('user', 'name email contact')
                    .populate('pet', 'name type breed age weight')
                    .populate('veterinarian', 'name email specialization')
                    .sort({ date: -1 });
            }
            res.json({
                success: true,
                data: { appointments },
                count: appointments.length
            });
        }
        catch (error) {
            console.error('Get my appointments error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get appointments'
            });
        }
    }
    async getAllAppointments(req, res) {
        try {
            res.json({
                success: true,
                data: []
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get all appointments' });
        }
    }
    async getAppointmentById(req, res) {
        try {
            const { appointmentId } = req.params;
            const userId = req.user?._id;
            const userRole = req.userRole;
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID'
                });
                return;
            }
            let query = { _id: appointmentId };
            if (userRole === 'veterinarian') {
                query.veterinarian = userId;
            }
            else {
                query.user = userId;
            }
            const appointment = await Appointment_1.default.findOne(query)
                .populate('user', 'name email contact')
                .populate('pet', 'name type breed age weight color medicalHistory')
                .populate('veterinarian', 'name email specialization experience consultationFeeRange');
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found or access denied'
                });
                return;
            }
            res.json({
                success: true,
                data: { appointment }
            });
        }
        catch (error) {
            console.error('Get appointment by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get appointment'
            });
        }
    }
    async approveAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const { consultationFee, veterinarianNotes } = req.body;
            const vetId = req.user?._id;
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOneAndUpdate({
                _id: appointmentId,
                veterinarian: vetId,
                status: 'PENDING'
            }, {
                status: 'APPROVED',
                consultationFee: consultationFee || 0,
                veterinarianNotes: veterinarianNotes || ''
            }, { new: true }).populate([
                { path: 'user', select: 'name email contact' },
                { path: 'pet', select: 'name type breed age weight' },
                { path: 'veterinarian', select: 'name email specialization' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found or cannot be approved'
                });
                return;
            }
            await this.notificationManager.onAppointmentApproved(appointment);
            res.json({
                success: true,
                message: 'Appointment approved successfully',
                data: { appointment }
            });
        }
        catch (error) {
            console.error('Approve appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to approve appointment'
            });
        }
    }
    async confirmAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const userId = req.user?._id;
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOneAndUpdate({
                _id: appointmentId,
                user: userId,
                status: 'APPROVED'
            }, { status: 'CONFIRMED' }, { new: true }).populate([
                { path: 'user', select: 'name email contact' },
                { path: 'pet', select: 'name type breed age weight' },
                { path: 'veterinarian', select: 'name email specialization' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found or cannot be confirmed'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Appointment confirmed successfully',
                data: { appointment }
            });
        }
        catch (error) {
            console.error('Confirm appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to confirm appointment'
            });
        }
    }
    async completeAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const { diagnosis, treatment, followUpRequired, veterinarianNotes } = req.body;
            const vetId = req.user?._id;
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID'
                });
                return;
            }
            if (!diagnosis || !treatment) {
                res.status(400).json({
                    success: false,
                    message: 'Diagnosis and treatment are required to complete the appointment'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOneAndUpdate({
                _id: appointmentId,
                veterinarian: vetId,
                status: { $in: ['APPROVED', 'CONFIRMED'] }
            }, {
                status: 'COMPLETED',
                diagnosis: diagnosis.trim(),
                treatment: treatment.trim(),
                followUpRequired: followUpRequired === true,
                veterinarianNotes: veterinarianNotes?.trim() || '',
                completedAt: new Date()
            }, { new: true }).populate([
                { path: 'user', select: 'name email contact' },
                { path: 'pet', select: 'name type breed age weight' },
                { path: 'veterinarian', select: 'name email specialization' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found or cannot be completed'
                });
                return;
            }
            await this.notificationManager.onAppointmentCompleted(appointment);
            res.json({
                success: true,
                message: 'Appointment completed successfully',
                data: { appointment }
            });
        }
        catch (error) {
            console.error('Complete appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to complete appointment',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
    async cancelAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const { reason } = req.body;
            const userId = req.user?._id;
            const userRole = req.userRole;
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID'
                });
                return;
            }
            let query = {
                _id: appointmentId,
                status: { $nin: ['CANCELLED', 'COMPLETED'] }
            };
            if (userRole === 'veterinarian') {
                query.veterinarian = userId;
            }
            else {
                query.user = userId;
            }
            const appointment = await Appointment_1.default.findOneAndUpdate(query, {
                status: 'CANCELLED',
                veterinarianNotes: reason ? `Cancelled: ${reason}` : 'Cancelled by user'
            }, { new: true }).populate([
                { path: 'user', select: 'name email contact' },
                { path: 'pet', select: 'name type breed age weight' },
                { path: 'veterinarian', select: 'name email specialization' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found or cannot be cancelled'
                });
                return;
            }
            await this.notificationManager.onAppointmentCancelled(appointment);
            res.json({
                success: true,
                message: 'Appointment cancelled successfully',
                data: { appointment }
            });
        }
        catch (error) {
            console.error('Cancel appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to cancel appointment'
            });
        }
    }
    async rejectAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const { reason } = req.body;
            const vetId = req.user?._id;
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOneAndUpdate({
                _id: appointmentId,
                veterinarian: vetId,
                status: 'PENDING'
            }, {
                status: 'REJECTED',
                veterinarianNotes: reason ? `Rejected: ${reason}` : 'Rejected by veterinarian'
            }, { new: true }).populate([
                { path: 'user', select: 'name email contact' },
                { path: 'pet', select: 'name type breed age weight' },
                { path: 'veterinarian', select: 'name email specialization' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found or cannot be rejected'
                });
                return;
            }
            await this.notificationManager.onAppointmentRejected(appointment);
            res.json({
                success: true,
                message: 'Appointment rejected successfully',
                data: { appointment }
            });
        }
        catch (error) {
            console.error('Reject appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reject appointment'
            });
        }
    }
    async rescheduleAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            const { date, timeSlot, reason } = req.body;
            const userId = req.user?._id;
            const userRole = req.userRole;
            if (!mongoose_1.default.Types.ObjectId.isValid(appointmentId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID'
                });
                return;
            }
            if (!date || !timeSlot || !timeSlot.startTime) {
                res.status(400).json({
                    success: false,
                    message: 'Date and time slot are required'
                });
                return;
            }
            let query = {
                _id: appointmentId,
                status: { $nin: ['CANCELLED', 'COMPLETED', 'REJECTED'] }
            };
            if (userRole === 'veterinarian') {
                query.veterinarian = userId;
            }
            else {
                query.user = userId;
            }
            const currentAppointment = await Appointment_1.default.findOne(query);
            if (!currentAppointment) {
                res.status(404).json({
                    success: false,
                    message: 'Appointment not found or cannot be rescheduled'
                });
                return;
            }
            const existingAppointment = await Appointment_1.default.findOne({
                veterinarian: currentAppointment.veterinarian,
                date: new Date(date),
                time: timeSlot.startTime,
                status: { $nin: ['CANCELLED', 'REJECTED'] },
                _id: { $ne: appointmentId }
            });
            if (existingAppointment) {
                res.status(409).json({
                    success: false,
                    message: 'Selected time slot is not available. Please choose another time.'
                });
                return;
            }
            const updatedAppointment = await Appointment_1.default.findByIdAndUpdate(appointmentId, {
                date: new Date(date),
                time: timeSlot.startTime,
                status: 'PENDING',
                veterinarianNotes: reason ? `Rescheduled: ${reason}` : 'Appointment rescheduled'
            }, { new: true }).populate([
                { path: 'user', select: 'name email contact' },
                { path: 'pet', select: 'name type breed age weight' },
                { path: 'veterinarian', select: 'name email specialization' }
            ]);
            if (!updatedAppointment) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to reschedule appointment'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Appointment rescheduled successfully',
                data: { appointment: updatedAppointment }
            });
        }
        catch (error) {
            console.error('Reschedule appointment error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to reschedule appointment'
            });
        }
    }
    async rateAppointment(req, res) {
        try {
            const { appointmentId } = req.params;
            res.json({
                success: true,
                message: 'Appointment rated successfully',
                data: { id: appointmentId, rating: req.body.rating || 5 }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to rate appointment' });
        }
    }
    async getUserAppointments(req, res) {
        try {
            const { userId } = req.params;
            res.json({
                success: true,
                data: { userId, appointments: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get user appointments' });
        }
    }
    async getVetAppointments(req, res) {
        try {
            const { vetId } = req.params;
            res.json({
                success: true,
                data: { vetId, appointments: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get veterinarian appointments' });
        }
    }
    async getAvailableSlots(req, res) {
        try {
            const { vetId } = req.params;
            const { date } = req.query;
            if (!mongoose_1.default.Types.ObjectId.isValid(vetId)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid veterinarian ID'
                });
                return;
            }
            if (!date) {
                res.status(400).json({
                    success: false,
                    message: 'Date is required'
                });
                return;
            }
            const vet = await Veterinarian_1.default.findById(vetId);
            if (!vet) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found'
                });
                return;
            }
            const requestedDate = new Date(date);
            const dayOfWeek = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
            const dayAvailability = vet.availability?.find(avail => avail.day === dayOfWeek && avail.enabled);
            if (!dayAvailability) {
                res.json({
                    success: true,
                    data: { slots: [] }
                });
                return;
            }
            const slots = [];
            const startTime = dayAvailability.startTime;
            const endTime = dayAvailability.endTime;
            const start = new Date(`2000-01-01 ${startTime}`);
            const end = new Date(`2000-01-01 ${endTime}`);
            while (start < end) {
                const timeStr = start.toTimeString().substring(0, 5);
                const existingAppointment = await Appointment_1.default.findOne({
                    veterinarian: vetId,
                    date: requestedDate,
                    time: timeStr,
                    status: { $nin: ['CANCELLED', 'REJECTED'] }
                });
                slots.push({
                    startTime: timeStr,
                    endTime: new Date(start.getTime() + 30 * 60000).toTimeString().substring(0, 5),
                    available: !existingAppointment
                });
                start.setMinutes(start.getMinutes() + 30);
            }
            res.json({
                success: true,
                data: { slots }
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
    async getPetAppointments(req, res) {
        try {
            const { petId } = req.params;
            res.json({
                success: true,
                data: { petId, appointments: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get pet appointments' });
        }
    }
    async getTodaysSchedule(req, res) {
        try {
            res.json({
                success: true,
                data: { date: new Date().toISOString().split('T')[0], schedule: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get today\'s schedule' });
        }
    }
    async getUpcomingReminders(req, res) {
        try {
            res.json({
                success: true,
                data: { reminders: [] }
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get upcoming reminders' });
        }
    }
}
exports.AppointmentController = AppointmentController;
const appointmentController = new AppointmentController();
exports.default = appointmentController;
//# sourceMappingURL=AppointmentController.js.map