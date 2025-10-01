import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IAppointment extends Document {
  user: mongoose.Types.ObjectId;
  veterinarian: mongoose.Types.ObjectId;
  pet: mongoose.Types.ObjectId;
  
  date: Date;
  time: string;
  
  status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  
  consultationFee?: number; // Set by veterinarian during approval
  reason: string;
  comments?: string; // Initial user comments
  veterinarianNotes?: string; // Notes added by veterinarian
  
  // Completion details
  diagnosis?: string;
  treatment?: string;
  prescriptions?: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  followUpRequired?: boolean;
  followUpDate?: Date;
  
  // Rating system
  rating?: number; // User rating after completion (1-5)
  review?: string; // User review text
  
  completedAt?: Date; // Date when appointment was marked as completed
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema({
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

const appointmentSchema = new Schema<IAppointment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  veterinarian: {
    type: Schema.Types.ObjectId,
    ref: 'Veterinarian',
    required: [true, 'Veterinarian is required']
  },
  pet: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'Pet is required']
  },
  
  date: {
    type: Date,
    required: [true, 'Appointment date is required'],
    validate: {
      validator: function(date: Date) {
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
    required: function(this: IAppointment) {
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
  
  // Completion details
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
      validator: function(this: IAppointment, date: Date) {
        if (!this.followUpRequired) return true;
        return date && date > new Date();
      },
      message: 'Follow-up date must be in the future when follow-up is required'
    }
  },
  
  // Rating system
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: function(this: IAppointment) {
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
      validator: function(this: IAppointment) {
        return !this.completedAt || this.status === 'COMPLETED';
      },
      message: 'Completion date can only be set for completed appointments'
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
appointmentSchema.index({ user: 1, date: -1 });
appointmentSchema.index({ veterinarian: 1, date: -1 });
appointmentSchema.index({ pet: 1, date: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1, time: 1 });
appointmentSchema.index({ veterinarian: 1, date: 1, time: 1 }); // For checking conflicts

// Virtual for formatted date and time
appointmentSchema.virtual('displayDateTime').get(function(this: IAppointment) {
  const date = new Date(this.date);
  return `${date.toLocaleDateString()} at ${this.time}`;
});

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function(this: IAppointment) {
  const appointmentDateTime = new Date(`${this.date.toDateString()} ${this.time}`);
  return appointmentDateTime < new Date();
});

// Pre-save middleware for validation
appointmentSchema.pre<IAppointment>('save', async function(next) {
  try {
    // Check for appointment conflicts for the same veterinarian
    if (this.isModified('date') || this.isModified('time') || this.isModified('veterinarian')) {
      const conflictingAppointment = await mongoose.model<IAppointment>('Appointment').findOne({
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

    // Update pet's lastVisit when appointment is completed
    if (this.isModified('status') && this.status === 'COMPLETED') {
      await mongoose.model('Pet').findByIdAndUpdate(this.pet, {
        lastVisit: this.date
      });
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Static method to find available time slots
appointmentSchema.statics.findAvailableSlots = async function(veterinarianId: string, date: Date) {
  const appointments = await this.find({
    veterinarian: veterinarianId,
    date: date,
    status: { $in: ['APPROVED', 'CONFIRMED'] }
  }).select('time');

  const bookedTimes = appointments.map((apt: IAppointment) => apt.time);
  
  // Generate available slots (9 AM to 5 PM, 30-minute intervals)
  const allSlots = [];
  for (let hour = 9; hour < 17; hour++) {
    allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  return allSlots.filter(slot => !bookedTimes.includes(slot));
};

// Interface for static methods
export interface IAppointmentModel extends Model<IAppointment> {
  findAvailableSlots(veterinarianId: string, date: Date): Promise<string[]>;
}

const Appointment = mongoose.model<IAppointment, IAppointmentModel>('Appointment', appointmentSchema);

export default Appointment;
