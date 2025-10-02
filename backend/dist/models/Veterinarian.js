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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const availabilitySchema = new mongoose_1.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: true
    }
});
const veterinarianSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required'],
        trim: true
    },
    profilePicture: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    specialization: {
        type: String,
        required: [true, 'Specialization is required'],
        enum: {
            values: ['General Practice', 'Surgery', 'Dental Care', 'Emergency Care', 'Dermatology', 'Cardiology', 'Orthopedics'],
            message: 'Please select a valid specialization'
        }
    },
    experience: {
        type: String,
        required: [true, 'Experience is required']
    },
    consultationFeeRange: {
        min: {
            type: Number,
            required: [true, 'Minimum consultation fee is required'],
            min: [10, 'Minimum consultation fee must be at least $10']
        },
        max: {
            type: Number,
            required: [true, 'Maximum consultation fee is required'],
            validate: {
                validator: function (value) {
                    return value > this.consultationFeeRange.min;
                },
                message: 'Maximum fee must be greater than minimum fee'
            }
        }
    },
    hospitalsServed: {
        type: String,
        default: ''
    },
    availability: {
        type: [availabilitySchema],
        default: [
            { day: 'Monday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Tuesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Wednesday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Thursday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Friday', startTime: '09:00', endTime: '17:00', enabled: true },
            { day: 'Saturday', startTime: '09:00', endTime: '13:00', enabled: false },
            { day: 'Sunday', startTime: '09:00', endTime: '13:00', enabled: false }
        ]
    },
    certifications: {
        type: [String],
        default: []
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Total reviews cannot be negative']
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    approvedAt: {
        type: Date,
        default: null
    },
    approvedBy: {
        type: String,
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    rejectedBy: {
        type: String,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    blockedAt: {
        type: Date,
        default: null
    },
    blockedBy: {
        type: String,
        default: null
    },
    blockReason: {
        type: String,
        default: null
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});
veterinarianSchema.index({ email: 1 });
veterinarianSchema.index({ specialization: 1 });
veterinarianSchema.index({ rating: -1 });
veterinarianSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(12);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
veterinarianSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
veterinarianSchema.methods.generatePasswordHash = async function (password) {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
};
const Veterinarian = mongoose_1.default.model('Veterinarian', veterinarianSchema);
exports.default = Veterinarian;
//# sourceMappingURL=Veterinarian.js.map