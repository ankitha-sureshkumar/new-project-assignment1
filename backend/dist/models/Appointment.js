"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const prescriptionSchema = new mongoose_1.Schema({
    medication: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    instructions: {
        type: String
    }
});
const appointmentSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    veterinarian: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Veterinarian',
        required: [true, 'Veterinarian is required']
    },
    pet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Pet',
        required: [true, 'Pet is required']
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function (date) {
                return date >= new Date();
            },
            message: 'Appointment date must be in the future'
        }
    },
    time: {
        type: String,
        required: [true, 'Appointment time is required'],
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ['PENDING', 'APPROVED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'],
            message: 'Status must be one of: PENDING, APPROVED, CONFIRMED, COMPLETED, CANCELLED, REJECTED'
        },
        default: 'PENDING'
    },
    consultationFee: {
        type: Number,
        min: [0, 'Consultation fee cannot be negative'],
        max: [10000, 'Consultation fee seems too high'],
        required: function () {
            return ['APPROVED', 'CONFIRMED', 'COMPLETED'].includes(this.status);
        }
    },
    reason: {
        type: String,
        required: [true, 'Reason for appointment is required'],
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    comments: {
        type: String,
        trim: true,
        maxlength: [1000, 'Comments cannot exceed 1000 characters']
    },
    veterinarianNotes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Veterinarian notes cannot exceed 2000 characters']
    },
    diagnosis: {
        type: String,
        trim: true,
        maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
    },
    treatment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Treatment cannot exceed 1000 characters']
    },
    prescriptions: {
        type: [prescriptionSchema],
        default: []
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date,
        validate: {
            validator: function (date) {
                if (!this.followUpRequired)
                    return true;
                return date && date > new Date();
            },
            message: 'Follow-up date must be in the future when follow-up is required'
        }
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        validate: {
            validator: function () {
                return !this.rating || this.status === 'COMPLETED';
            },
            message: 'Rating can only be given for completed appointments'
        }
    },
    review: {
        type: String,
        trim: true,
        maxlength: [500, 'Review cannot exceed 500 characters']
    },
    completedAt: {
        type: Date,
        validate: {
            validator: function () {
                return !this.completedAt || this.status === 'COMPLETED';
            },
            message: 'Completion date can only be set for completed appointments'
        }
    }
}, {
    timestamps: true
});
appointmentSchema.index({ user: 1, date: -1 });
appointmentSchema.index({ veterinarian: 1, date: -1 });
appointmentSchema.index({ pet: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ veterinarian: 1, date: 1, time: 1 });
appointmentSchema.virtual('displayDateTime').get(function () {
    const date = new Date(this.date);
    return `${date.toLocaleDateString()} at ${this.time}`;
});
appointmentSchema.virtual('isPast').get(function () {
    const appointmentDateTime = new Date(`${this.date.toDateString()} ${this.time}`);
    return appointmentDateTime < new Date();
});
appointmentSchema.pre('save', async function (next) {
    try {
        if (this.isModified('date') || this.isModified('time') || this.isModified('veterinarian')) {
            const conflictingAppointment = await mongoose_1.default.model('Appointment').findOne({
                _id: { $ne: this._id },
                veterinarian: this.veterinarian,
                date: this.date,
                time: this.time,
                status: { $in: ['APPROVED', 'CONFIRMED'] }
            });
            if (conflictingAppointment) {
                const error = new Error('This time slot is already booked for the selected veterinarian');
                return next(error);
            }
        }
        if (this.isModified('status') && this.status === 'COMPLETED') {
            await mongoose_1.default.model('Pet').findByIdAndUpdate(this.pet, {
                lastVisit: this.date
            });
        }
        next();
    }
    catch (error) {
        next(error);
    }
});
appointmentSchema.statics.findAvailableSlots = async function (veterinarianId, date) {
    const appointments = await this.find({
        veterinarian: veterinarianId,
        date: date,
        status: { $in: ['APPROVED', 'CONFIRMED'] }
    }).select('time');
    const bookedTimes = appointments.map((apt) => apt.time);
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return allSlots.filter(slot => !bookedTimes.includes(slot));
};
const Appointment = mongoose_1.default.model('Appointment', appointmentSchema);
exports.default = Appointment;
//# sourceMappingURL=Appointment.js.map