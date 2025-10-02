import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IVeterinarian extends Document {
  name: string;
  email: string;
  password: string;
  contact: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  
  // Veterinarian-specific fields
  specialization: string;
  experience: string;
  consultationFeeRange: {
    min: number;
    max: number;
  };
  hospitalsServed?: string;
  availability: Array<{
    day: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
  }>;
  certifications: string[];
  rating: number;
  totalReviews: number;
  
  // Admin management fields
  isApproved: boolean;
  isBlocked: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  blockedAt?: Date;
  blockedBy?: string;
  blockReason?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordHash(password: string): Promise<string>;
}

const availabilitySchema = new Schema({
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

const veterinarianSchema = new Schema<IVeterinarian>({
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
    select: false // Don't include password in queries by default
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
  
  // Veterinarian-specific fields
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
        validator: function(this: IVeterinarian, value: number) {
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
  
  // Admin management fields
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

// Index for better query performance
veterinarianSchema.index({ email: 1 });
veterinarianSchema.index({ specialization: 1 });
veterinarianSchema.index({ rating: -1 });

// Pre-save middleware to hash password
veterinarianSchema.pre<IVeterinarian>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
veterinarianSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password hash
veterinarianSchema.methods.generatePasswordHash = async function(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const Veterinarian = mongoose.model<IVeterinarian>('Veterinarian', veterinarianSchema);

export default Veterinarian;