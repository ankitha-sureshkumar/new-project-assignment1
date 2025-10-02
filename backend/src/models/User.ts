import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  contact: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  
  // User-specific fields
  address: string;
  petOwnership?: string;
  preferredContact: 'email' | 'phone' | 'both';
  
  // Admin management fields
  isBlocked: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  blockReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordHash(password: string): Promise<string>;
}


const userSchema = new Schema<IUser>({
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
  
  // User-specific fields
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  petOwnership: {
    type: String,
    default: ''
  },
  preferredContact: {
    type: String,
    enum: ['email', 'phone', 'both'],
    default: 'email'
  },
  
  // Admin management fields
  isBlocked: {
    type: Boolean,
    default: false
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
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });

// Pre-save middleware to hash password
userSchema.pre<IUser>('save', async function(next) {
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
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to generate password hash
userSchema.methods.generatePasswordHash = async function(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;