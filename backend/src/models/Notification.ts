import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'appointment_request' | 'appointment_approved' | 'appointment_confirmed' | 'appointment_completed' | 'appointment_cancelled' | 'appointment_rejected' | 'reminder' | 'system';
  title: string;
  message: string;
  relatedAppointment?: mongoose.Types.ObjectId;
  relatedUser?: mongoose.Types.ObjectId;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  type: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: {
      values: [
        'appointment_request',
        'appointment_approved', 
        'appointment_confirmed',
        'appointment_completed',
        'appointment_cancelled',
        'appointment_rejected',
        'reminder',
        'system'
      ],
      message: 'Invalid notification type'
    }
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Notification message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  relatedAppointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
    default: null
  },
  relatedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  read: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function(this: INotification) {
  const now = new Date();
  const diff = now.getTime() - this.createdAt.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  return `${days} day${days === 1 ? '' : 's'} ago`;
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(data: Partial<INotification>) {
  const notification = new this(data);
  await notification.save();
  
  // TODO: Emit socket event for real-time updates
  // io.to(data.recipient.toString()).emit('notification', notification);
  
  return notification;
};

// Static method to mark all notifications as read for a user
notificationSchema.statics.markAllAsRead = async function(userId: string) {
  return this.updateMany(
    { recipient: userId, read: false },
    { read: true }
  );
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId: string) {
  return this.countDocuments({ recipient: userId, read: false });
};

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;