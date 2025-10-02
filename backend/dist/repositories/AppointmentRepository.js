"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
class AppointmentRepository {
    async findByUser(userId) {
        return Appointment_1.default.find({ user: userId })
            .populate('user', 'name email contact')
            .populate('pet', 'name type breed age weight')
            .populate('veterinarian', 'name email specialization')
            .sort({ date: -1 });
    }
    async findByVeterinarian(vetId) {
        return Appointment_1.default.find({ veterinarian: vetId })
            .populate('user', 'name email contact')
            .populate('pet', 'name type breed age weight')
            .populate('veterinarian', 'name email specialization')
            .sort({ date: -1 });
    }
    async findByIdForRole(appointmentId, userId, role) {
        const query = { _id: appointmentId };
        if (role === 'user')
            query.user = userId;
        else
            query.veterinarian = userId;
        return Appointment_1.default.findOne(query)
            .populate('user', 'name email contact')
            .populate('pet', 'name type breed age weight color medicalHistory')
            .populate('veterinarian', 'name email specialization experience consultationFeeRange');
    }
    async findConflict(vetId, date, time, excludeId) {
        const q = { veterinarian: vetId, date, time, status: { $nin: ['CANCELLED', 'REJECTED'] } };
        if (excludeId && mongoose_1.default.Types.ObjectId.isValid(excludeId))
            q._id = { $ne: excludeId };
        return Appointment_1.default.findOne(q);
    }
    async create(data) {
        const appointment = new Appointment_1.default(data);
        await appointment.save();
        return appointment;
    }
    async updateById(id, patch) {
        return Appointment_1.default.findByIdAndUpdate(id, patch, { new: true })
            .populate('user', 'name email contact')
            .populate('pet', 'name type breed age weight')
            .populate('veterinarian', 'name email specialization');
    }
}
exports.AppointmentRepository = AppointmentRepository;
//# sourceMappingURL=AppointmentRepository.js.map