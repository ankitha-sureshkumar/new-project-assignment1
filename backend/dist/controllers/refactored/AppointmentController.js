"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateAppointment = exports.getAvailableSlots = exports.getVeterinarianAppointments = exports.getUserAppointments = exports.completeAppointment = exports.confirmAppointment = exports.approveAppointment = exports.bookAppointment = exports.AppointmentController = void 0;
const express_validator_1 = require("express-validator");
const NotificationObserver_1 = require("../../patterns/NotificationObserver");
const AccessProxy_1 = require("../../patterns/AccessProxy");
const StrategyPattern_1 = require("../../patterns/StrategyPattern");
const Appointment_1 = __importDefault(require("../../models/Appointment"));
const Pet_1 = __importDefault(require("../../models/Pet"));
const Veterinarian_1 = __importDefault(require("../../models/Veterinarian"));
class AppointmentController {
    constructor() {
        this.notificationManager = new NotificationObserver_1.NotificationManager();
        this.secureDataService = new AccessProxy_1.SecureDataService();
        this.pricingService = new StrategyPattern_1.PricingService(StrategyPattern_1.StrategyFactory.createPricingStrategy('consultation'));
    }
    async bookAppointment(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
            const userId = req.userId;
            const { veterinarianId, petId, date, time, reason, comments } = req.body;
            if (!veterinarianId.match(/^[0-9a-fA-F]{24}$/) ||
                !petId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid ID format'
                });
                return;
            }
            const pet = await Pet_1.default.findOne({ _id: petId, owner: userId, isActive: true });
            if (!pet) {
                res.status(404).json({
                    success: false,
                    message: 'Pet not found or you do not have permission to book appointments for this pet'
                });
                return;
            }
            const veterinarian = await Veterinarian_1.default.findById(veterinarianId);
            if (!veterinarian || !veterinarian.isApproved || veterinarian.isBlocked) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found or not available'
                });
                return;
            }
            const appointmentDate = new Date(date);
            const now = new Date();
            if (appointmentDate <= now) {
                res.status(400).json({
                    success: false,
                    message: 'Appointment date must be in the future'
                });
                return;
            }
            const conflictingAppointment = await Appointment_1.default.findOne({
                veterinarian: veterinarianId,
                date: appointmentDate,
                time: time,
                status: { $in: ['APPROVED', 'CONFIRMED'] }
            });
            if (conflictingAppointment) {
                res.status(409).json({
                    success: false,
                    message: 'This time slot is already booked. Please choose a different time.'
                });
                return;
            }
            const appointmentData = {
                user: userId,
                veterinarian: veterinarianId,
                pet: petId,
                date: appointmentDate,
                time,
                reason: reason.trim(),
                comments: comments?.trim(),
                status: 'PENDING'
            };
            const newAppointment = new Appointment_1.default(appointmentData);
            await newAppointment.save();
            await newAppointment.populate([
                { path: 'veterinarian', select: 'name specialization' },
                { path: 'pet', select: 'name type breed' }
            ]);
            await this.notificationManager.onAppointmentCreated(newAppointment.toObject());
            res.status(201).json({
                success: true,
                message: 'Appointment request sent successfully. Waiting for veterinarian approval.',
                data: {
                    appointment: newAppointment
                }
            });
            console.log(`✅ Appointment booked: ${newAppointment._id} by user ${userId}`);
        }
        catch (error) {
            console.error('❌ Book appointment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to book appointment'
            });
        }
    }
    async approveAppointment(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
            const veterinarianId = req.userId;
            const { appointmentId } = req.params;
            const { consultationFee, veterinarianNotes, action } = req.body;
            if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID format'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOne({
                _id: appointmentId,
                veterinarian: veterinarianId,
                status: 'PENDING'
            }).populate([
                { path: 'user', select: 'name email' },
                { path: 'pet', select: 'name type breed' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Pending appointment not found or you do not have permission to modify it'
                });
                return;
            }
            if (action === 'reject') {
                appointment.status = 'REJECTED';
                appointment.veterinarianNotes = veterinarianNotes || 'Appointment rejected by veterinarian';
                await appointment.save();
                await this.notificationManager.onAppointmentRejected(appointment.toObject());
                res.json({
                    success: true,
                    message: 'Appointment rejected',
                    data: { appointment }
                });
                console.log(`✅ Appointment rejected: ${appointmentId} by vet ${veterinarianId}`);
                return;
            }
            if (!consultationFee || consultationFee <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Valid consultation fee is required for approval'
                });
                return;
            }
            const pricingFactors = {
                isEmergency: appointment.reason.toLowerCase().includes('emergency'),
                timeOfDay: this.getTimeOfDay(appointment.time),
                followUp: appointment.reason.toLowerCase().includes('follow')
            };
            const pricingCalculation = this.pricingService.calculatePrice(parseFloat(consultationFee), pricingFactors);
            appointment.status = 'APPROVED';
            appointment.consultationFee = pricingCalculation.totalCost;
            appointment.veterinarianNotes = veterinarianNotes || 'Appointment approved. Please confirm to proceed.';
            await appointment.save();
            await this.notificationManager.onAppointmentApproved(appointment.toObject());
            res.json({
                success: true,
                message: 'Appointment approved. User will be notified to confirm.',
                data: {
                    appointment,
                    pricing: pricingCalculation
                }
            });
            console.log(`✅ Appointment approved: ${appointmentId} with fee $${pricingCalculation.totalCost}`);
        }
        catch (error) {
            console.error('❌ Approve appointment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to process appointment'
            });
        }
    }
    async confirmAppointment(req, res) {
        try {
            const userId = req.userId;
            const { appointmentId } = req.params;
            const { action, userNotes } = req.body;
            if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID format'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOne({
                _id: appointmentId,
                user: userId,
                status: 'APPROVED'
            }).populate([
                { path: 'veterinarian', select: 'name specialization' },
                { path: 'pet', select: 'name type breed' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Approved appointment not found or you do not have permission to confirm it'
                });
                return;
            }
            if (action === 'decline') {
                appointment.status = 'CANCELLED';
                appointment.comments = userNotes || 'Cancelled by user after approval';
                await appointment.save();
                await this.notificationManager.onAppointmentCancelled(appointment.toObject());
                res.json({
                    success: true,
                    message: 'Appointment cancelled',
                    data: { appointment }
                });
                console.log(`✅ Appointment cancelled by user: ${appointmentId}`);
                return;
            }
            appointment.status = 'CONFIRMED';
            if (userNotes) {
                appointment.comments = userNotes.trim();
            }
            await appointment.save();
            await this.notificationManager.onAppointmentApproved(appointment.toObject());
            res.json({
                success: true,
                message: 'Appointment confirmed successfully. See you on the scheduled date!',
                data: { appointment }
            });
            console.log(`✅ Appointment confirmed: ${appointmentId} by user ${userId}`);
        }
        catch (error) {
            console.error('❌ Confirm appointment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to confirm appointment'
            });
        }
    }
    async completeAppointment(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
            const veterinarianId = req.userId;
            const { appointmentId } = req.params;
            const { diagnosis, treatment, prescriptions, followUpRequired, followUpDate, veterinarianNotes } = req.body;
            if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID format'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOne({
                _id: appointmentId,
                veterinarian: veterinarianId,
                status: 'CONFIRMED'
            }).populate([
                { path: 'user', select: 'name email' },
                { path: 'pet', select: 'name type breed' }
            ]);
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Confirmed appointment not found or you do not have permission to complete it'
                });
                return;
            }
            if (followUpRequired && followUpDate) {
                const followUp = new Date(followUpDate);
                if (followUp <= new Date()) {
                    res.status(400).json({
                        success: false,
                        message: 'Follow-up date must be in the future'
                    });
                    return;
                }
            }
            appointment.status = 'COMPLETED';
            appointment.diagnosis = diagnosis?.trim();
            appointment.treatment = treatment?.trim();
            appointment.prescriptions = prescriptions || [];
            appointment.followUpRequired = followUpRequired || false;
            if (followUpRequired && followUpDate) {
                appointment.followUpDate = new Date(followUpDate);
            }
            appointment.veterinarianNotes = veterinarianNotes?.trim();
            await appointment.save();
            await Pet_1.default.findByIdAndUpdate(appointment.pet, {
                lastVisit: appointment.date
            });
            await this.notificationManager.onAppointmentCompleted(appointment.toObject());
            res.json({
                success: true,
                message: 'Appointment completed successfully',
                data: { appointment }
            });
            console.log(`✅ Appointment completed: ${appointmentId} by vet ${veterinarianId}`);
        }
        catch (error) {
            console.error('❌ Complete appointment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to complete appointment'
            });
        }
    }
    async getUserAppointments(req, res) {
        try {
            const userId = req.userId;
            const { status, limit = 10, page = 1 } = req.query;
            const filter = { user: userId };
            if (status) {
                filter.status = status;
            }
            const appointments = await Appointment_1.default.find(filter)
                .populate('veterinarian', 'name specialization profilePicture')
                .populate('pet', 'name type breed profilePicture')
                .sort({ date: -1 })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit));
            const total = await Appointment_1.default.countDocuments(filter);
            res.json({
                success: true,
                data: {
                    appointments,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });
            console.log(`✅ Retrieved ${appointments.length} appointments for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Get user appointments error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve appointments'
            });
        }
    }
    async getVeterinarianAppointments(req, res) {
        try {
            const veterinarianId = req.userId;
            const { status, date, limit = 10, page = 1 } = req.query;
            const filter = { veterinarian: veterinarianId };
            if (status) {
                filter.status = status;
            }
            if (date) {
                const appointmentDate = new Date(date);
                filter.date = {
                    $gte: appointmentDate,
                    $lt: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)
                };
            }
            const appointments = await Appointment_1.default.find(filter)
                .populate('user', 'name contact profilePicture')
                .populate('pet', 'name type breed age profilePicture medicalHistory allergies')
                .sort({ date: 1, time: 1 })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * parseInt(limit));
            const total = await Appointment_1.default.countDocuments(filter);
            res.json({
                success: true,
                data: {
                    appointments,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            });
            console.log(`✅ Retrieved ${appointments.length} appointments for veterinarian ${veterinarianId}`);
        }
        catch (error) {
            console.error('❌ Get veterinarian appointments error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to retrieve appointments'
            });
        }
    }
    async getAvailableSlots(req, res) {
        try {
            const { veterinarianId, date } = req.query;
            if (!veterinarianId || !date) {
                res.status(400).json({
                    success: false,
                    message: 'Veterinarian ID and date are required'
                });
                return;
            }
            if (!veterinarianId.toString().match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid veterinarian ID format'
                });
                return;
            }
            const veterinarian = await Veterinarian_1.default.findOne({
                _id: veterinarianId,
                isApproved: true,
                isBlocked: false
            });
            if (!veterinarian) {
                res.status(404).json({
                    success: false,
                    message: 'Veterinarian not found or not available'
                });
                return;
            }
            const appointmentDate = new Date(date);
            const availableSlots = await Appointment_1.default.findAvailableSlots(veterinarianId, appointmentDate);
            res.json({
                success: true,
                data: {
                    date: appointmentDate.toDateString(),
                    veterinarian: {
                        id: veterinarian._id,
                        name: veterinarian.name,
                        specialization: veterinarian.specialization
                    },
                    availableSlots
                }
            });
        }
        catch (error) {
            console.error('❌ Get available slots error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get available slots'
            });
        }
    }
    async rateAppointment(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
                return;
            }
            const userId = req.userId;
            const { appointmentId } = req.params;
            const { rating, review } = req.body;
            if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid appointment ID format'
                });
                return;
            }
            const appointment = await Appointment_1.default.findOne({
                _id: appointmentId,
                user: userId,
                status: 'COMPLETED'
            });
            if (!appointment) {
                res.status(404).json({
                    success: false,
                    message: 'Completed appointment not found'
                });
                return;
            }
            if (appointment.rating) {
                res.status(400).json({
                    success: false,
                    message: 'This appointment has already been rated'
                });
                return;
            }
            appointment.rating = parseInt(rating);
            appointment.review = review?.trim();
            await appointment.save();
            res.json({
                success: true,
                message: 'Thank you for your feedback!',
                data: {
                    rating: appointment.rating,
                    review: appointment.review
                }
            });
            console.log(`✅ Appointment rated: ${appointmentId} - ${rating} stars`);
        }
        catch (error) {
            console.error('❌ Rate appointment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to rate appointment'
            });
        }
    }
    getTimeOfDay(time) {
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12)
            return 'morning';
        if (hour < 17)
            return 'afternoon';
        return 'evening';
    }
}
exports.AppointmentController = AppointmentController;
const appointmentController = new AppointmentController();
_a = {
    bookAppointment: appointmentController.bookAppointment.bind(appointmentController),
    approveAppointment: appointmentController.approveAppointment.bind(appointmentController),
    confirmAppointment: appointmentController.confirmAppointment.bind(appointmentController),
    completeAppointment: appointmentController.completeAppointment.bind(appointmentController),
    getUserAppointments: appointmentController.getUserAppointments.bind(appointmentController),
    getVeterinarianAppointments: appointmentController.getVeterinarianAppointments.bind(appointmentController),
    getAvailableSlots: appointmentController.getAvailableSlots.bind(appointmentController),
    rateAppointment: appointmentController.rateAppointment.bind(appointmentController)
}, exports.bookAppointment = _a.bookAppointment, exports.approveAppointment = _a.approveAppointment, exports.confirmAppointment = _a.confirmAppointment, exports.completeAppointment = _a.completeAppointment, exports.getUserAppointments = _a.getUserAppointments, exports.getVeterinarianAppointments = _a.getVeterinarianAppointments, exports.getAvailableSlots = _a.getAvailableSlots, exports.rateAppointment = _a.rateAppointment;
exports.default = appointmentController;
//# sourceMappingURL=AppointmentController.js.map