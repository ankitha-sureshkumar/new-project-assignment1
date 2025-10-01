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
const medicationSchema = new mongoose_1.Schema({
    name: {
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date
    }
});
const emergencyContactSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    relation: {
        type: String,
        required: true
    }
});
const petSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Pet name is required'],
        trim: true,
        minlength: [1, 'Pet name must be at least 1 character long'],
        maxlength: [30, 'Pet name cannot exceed 30 characters']
    },
    type: {
        type: String,
        required: [true, 'Pet type is required'],
        enum: {
            values: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Other'],
            message: 'Pet type must be one of: Dog, Cat, Bird, Rabbit, Other'
        }
    },
    breed: {
        type: String,
        required: [true, 'Pet breed is required'],
        trim: true,
        maxlength: [50, 'Breed cannot exceed 50 characters']
    },
    age: {
        type: String,
        required: [true, 'Pet age is required'],
        trim: true
    },
    weight: {
        type: Number,
        min: [0.1, 'Weight must be at least 0.1 kg'],
        max: [200, 'Weight cannot exceed 200 kg']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Unknown'],
        default: 'Unknown'
    },
    color: {
        type: String,
        trim: true,
        maxlength: [50, 'Color description cannot exceed 50 characters']
    },
    microchipId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        maxlength: [20, 'Microchip ID cannot exceed 20 characters']
    },
    owner: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Pet owner is required']
    },
    medicalHistory: {
        type: String,
        default: 'No medical history recorded',
        maxlength: [1000, 'Medical history cannot exceed 1000 characters']
    },
    vaccinations: {
        type: String,
        default: 'No vaccinations recorded',
        maxlength: [500, 'Vaccinations info cannot exceed 500 characters']
    },
    photos: {
        type: [String],
        default: [],
        validate: {
            validator: function (photos) {
                return photos.length <= 5;
            },
            message: 'Cannot have more than 5 photos per pet'
        }
    },
    profilePicture: {
        type: String,
        default: null
    },
    lastVisit: {
        type: Date,
        default: null
    },
    allergies: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    medications: {
        type: [medicationSchema],
        default: []
    },
    emergencyContact: {
        type: emergencyContactSchema,
        default: null
    }
}, {
    timestamps: true
});
petSchema.index({ owner: 1 });
petSchema.index({ type: 1 });
petSchema.index({ name: 1, owner: 1 });
petSchema.virtual('displayAge').get(function () {
    const age = this.age;
    if (age.includes('year') || age.includes('month') || age.includes('week')) {
        return age;
    }
    return `${age} years`;
});
petSchema.methods.updateActivity = function () {
    return this.save();
};
petSchema.statics.findByOwner = function (ownerId) {
    return this.find({ owner: ownerId, isActive: true }).sort({ createdAt: -1 });
};
petSchema.pre('save', function (next) {
    if (this.isNew) {
        this.lastVisit = undefined;
    }
    next();
});
const Pet = mongoose_1.default.model('Pet', petSchema);
exports.default = Pet;
//# sourceMappingURL=Pet.js.map