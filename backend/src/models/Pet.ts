import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPet extends Document {
  name: string;
  type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
  breed: string;
  age: string;
  weight?: number;
  gender?: 'Male' | 'Female' | 'Unknown';
  color?: string;
  microchipId?: string;
  owner: mongoose.Types.ObjectId;
  medicalHistory: string;
  vaccinations: string;
  photos: string[];
  profilePicture?: string;
  lastVisit?: Date;
  allergies?: string[];
  isActive: boolean;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    endDate?: Date;
  }>;
  emergencyContact?: {
    name: string;
    contact: string;
    relation: string;
  };
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  updateActivity(): Promise<IPet>;
}

const medicationSchema = new Schema({
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

const emergencyContactSchema = new Schema({
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

const petSchema = new Schema<IPet>({
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
    type: Schema.Types.ObjectId,
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
      validator: function(photos: string[]) {
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

// Index for better query performance
petSchema.index({ owner: 1 });
petSchema.index({ type: 1 });
petSchema.index({ name: 1, owner: 1 });

// Virtual for pet age in a more readable format
petSchema.virtual('displayAge').get(function(this: IPet) {
  const age = this.age;
  if (age.includes('year') || age.includes('month') || age.includes('week')) {
    return age;
  }
  return `${age} years`;
});

// Instance method to update activity
petSchema.methods.updateActivity = function() {
  return this.save();
};

// Static method to find pets by owner
petSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ owner: ownerId, isActive: true }).sort({ createdAt: -1 });
};

// Pre-save middleware to update lastVisit when appropriate
petSchema.pre<IPet>('save', function(next) {
  if (this.isNew) {
    this.lastVisit = undefined;
  }
  next();
});

// Interface for static methods
export interface IPetModel extends Model<IPet> {
  findByOwner(ownerId: string): Promise<IPet[]>;
}

const Pet = mongoose.model<IPet, IPetModel>('Pet', petSchema);

export default Pet;
