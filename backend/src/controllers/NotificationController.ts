import { Request, Response } from 'express';
import Notification, { INotification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Helper functions
function mapNotificationType(dbType: string): string {
  const typeMap: { [key: string]: string } = {
    'appointment_request': 'appointment',
    'appointment_approved': 'appointment',
    'appointment_confirmed': 'appointment',
    'appointment_completed': 'appointment',
    'appointment_cancelled': 'cancellation',
    'appointment_rejected': 'appointment',
    'reminder': 'reminder',
    'system': 'reminder'
  };

  return typeMap[dbType] || 'reminder';
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - new Date(date).getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

export class NotificationController {
  
  // Get user notifications
  async getUserNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const { unreadOnly, limit = 10, page = 1 } = req.query;
      
      const query: any = { recipient: userId };
      if (unreadOnly === 'true') {
        query.read = false;
      }

      const limitNum = parseInt(limit as string, 10);
      const pageNum = parseInt(page as string, 10);
      const skip = (pageNum - 1) * limitNum;

      const notifications = await Notification
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .populate('relatedAppointment', 'date timeSlot status reason')
        .populate('relatedUser', 'name email')
        .lean();

      // Transform notifications to match frontend format
      const transformedNotifications = notifications.map(notification => ({
        id: notification._id.toString(),
        type: mapNotificationType(notification.type),
        title: notification.title,
        message: notification.message,
        time: getRelativeTime(notification.createdAt),
        read: notification.read,
        data: {
          appointmentId: notification.relatedAppointment?._id,
          userId: notification.relatedUser?._id,
          priority: notification.priority
        },
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt
      }));

      res.status(200).json({
        success: true,
        message: 'Notifications retrieved successfully',
        data: {
          notifications: transformedNotifications,
          totalCount: await Notification.countDocuments(query)
        }
      });

    } catch (error: any) {
      console.error('Get user notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Mark notification as read
  async markNotificationAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { notificationId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        });
        return;
      }

      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true },
        { new: true }
      );

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: { notification }
      });

    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const result = await Notification.updateMany(
        { recipient: userId, read: false },
        { read: true }
      );

      res.status(200).json({
        success: true,
        message: `Marked ${result.modifiedCount} notifications as read`,
        data: { modifiedCount: result.modifiedCount }
      });

    } catch (error: any) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get unread notification count
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const count = await Notification.countDocuments({ 
        recipient: userId, 
        read: false 
      });

      res.status(200).json({
        success: true,
        message: 'Unread count retrieved successfully',
        data: { unreadCount: count }
      });

    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete notification
  async deleteNotification(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?._id;
      const { notificationId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(notificationId)) {
        res.status(400).json({
          success: false,
          message: 'Invalid notification ID'
        });
        return;
      }

      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });

      if (!notification) {
        res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create notification (internal use)
  async createNotification(data: {
    recipient: string;
    type: string;
    title: string;
    message: string;
    relatedAppointment?: string;
    relatedUser?: string;
    priority?: 'low' | 'medium' | 'high';
  }): Promise<INotification | null> {
    try {
      const notification = new Notification({
        recipient: data.recipient,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedAppointment: data.relatedAppointment,
        relatedUser: data.relatedUser,
        priority: data.priority || 'medium',
        read: false
      });

      await notification.save();
      return notification;

    } catch (error: any) {
      console.error('Create notification error:', error);
      return null;
    }
  }

  // Helper methods moved to top of file as standalone functions
}

export default new NotificationController();