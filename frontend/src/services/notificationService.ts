import { Appointment } from './appointmentService';
import api from './api';

export interface Notification {
  id: string;
  type: 'appointment' | 'reminder' | 'feedback' | 'new_appointment' | 'cancellation' | 'reschedule';
  title: string;
  message: string;
  time: string;
  read: boolean;
  data?: any; // Additional data for the notification
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

class NotificationService {
  // Generate notifications for users based on appointments
  generateUserNotifications(appointments: Appointment[]): Notification[] {
    const notifications: Notification[] = [];
    const now = new Date();

    appointments.forEach(appointment => {
      const appointmentDate = new Date(appointment.date);
      const timeDiff = appointmentDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Appointment approved notification
      if (appointment.status === 'approved' && !appointment.consultationCost) {
        notifications.push({
          id: `apt-approved-${appointment._id}`,
          type: 'appointment',
          title: 'Appointment Approved',
          message: `Your appointment for ${appointment.pet.name} has been approved by Dr. ${appointment.veterinarian.name}`,
          time: this.getRelativeTime(appointment.updatedAt),
          read: false,
          data: { appointmentId: appointment._id }
        });
      }

      // Appointment confirmed notification
      if (appointment.status === 'confirmed') {
        notifications.push({
          id: `apt-confirmed-${appointment._id}`,
          type: 'appointment',
          title: 'Appointment Confirmed',
          message: `Your appointment for ${appointment.pet.name} is confirmed for ${this.formatDate(appointment.date)}`,
          time: this.getRelativeTime(appointment.updatedAt),
          read: false,
          data: { appointmentId: appointment._id }
        });
      }

      // Appointment reminder (1 day before)
      if ((appointment.status === 'confirmed' || appointment.status === 'approved') && daysDiff === 1) {
        notifications.push({
          id: `reminder-${appointment._id}`,
          type: 'reminder',
          title: 'Appointment Reminder',
          message: `Don't forget! ${appointment.pet.name} has an appointment tomorrow with Dr. ${appointment.veterinarian.name}`,
          time: '1 day ago',
          read: false,
          data: { appointmentId: appointment._id }
        });
      }

      // Rate your visit notification
      if (appointment.status === 'completed' && !appointment.rating) {
        notifications.push({
          id: `rate-${appointment._id}`,
          type: 'feedback',
          title: 'Rate Your Visit',
          message: `How was ${appointment.pet.name}'s visit with Dr. ${appointment.veterinarian.name}? Please leave a review`,
          time: this.getRelativeTime(appointment.updatedAt),
          read: false,
          data: { appointmentId: appointment._id }
        });
      }

      // Follow-up reminder for completed appointments
      if (appointment.status === 'completed' && appointment.veterinarianNotes?.includes('follow-up')) {
        const followUpDate = new Date(appointmentDate);
        followUpDate.setMonth(followUpDate.getMonth() + 3); // 3 months follow-up
        
        if (Math.abs(followUpDate.getTime() - now.getTime()) < (7 * 24 * 60 * 60 * 1000)) { // Within a week
          notifications.push({
            id: `followup-${appointment._id}`,
            type: 'reminder',
            title: 'Follow-up Reminder',
            message: `It's time for ${appointment.pet.name}'s follow-up appointment`,
            time: '3 days ago',
            read: false,
            data: { appointmentId: appointment._id }
          });
        }
      }
    });

    return notifications.slice(0, 10); // Limit to 10 most recent notifications
  }

  // Generate notifications for veterinarians based on appointments
  generateVeterinarianNotifications(appointments: Appointment[]): Notification[] {
    const notifications: Notification[] = [];
    const now = new Date();

    appointments.forEach(appointment => {
      // New appointment request
      if (appointment.status === 'pending') {
        notifications.push({
          id: `new-apt-${appointment._id}`,
          type: 'new_appointment',
          title: 'New Appointment Request',
          message: `${appointment.user.name} has requested an appointment for ${appointment.pet.name} (${appointment.pet.breed})`,
          time: this.getRelativeTime(appointment.createdAt),
          read: false,
          data: { appointmentId: appointment._id }
        });
      }

      // Appointment cancellation
      if (appointment.status === 'cancelled') {
        notifications.push({
          id: `cancelled-${appointment._id}`,
          type: 'cancellation',
          title: 'Appointment Cancelled',
          message: `${appointment.user.name} has cancelled the appointment for ${appointment.pet.name}`,
          time: this.getRelativeTime(appointment.updatedAt),
          read: false,
          data: { appointmentId: appointment._id }
        });
      }

      // Today's appointments reminder
      const appointmentDate = new Date(appointment.date);
      if (this.isSameDay(appointmentDate, now) && (appointment.status === 'confirmed' || appointment.status === 'approved')) {
        notifications.push({
          id: `today-${appointment._id}`,
          type: 'reminder',
          title: 'Today\'s Appointment',
          message: `Appointment with ${appointment.user.name} for ${appointment.pet.name} at ${this.formatTimeSlot(appointment.timeSlot)}`,
          time: 'Today',
          read: false,
          data: { appointmentId: appointment._id }
        });
      }
    });

    return notifications.slice(0, 10);
  }

  // Helper method to get relative time
  private getRelativeTime(date: Date): string {
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
      return this.formatDate(date);
    }
  }

  // Helper method to format date
  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Helper method to format time slot
  private formatTimeSlot(timeSlot: { startTime: string; endTime: string }): string {
    return `${this.formatTime(timeSlot.startTime)} - ${this.formatTime(timeSlot.endTime)}`;
  }

  // Helper method to format time
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  // Helper method to check if two dates are the same day
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  // Mark notification as read
  markAsRead(notifications: Notification[], notificationId: string): Notification[] {
    return notifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
  }

  // Remove notification
  removeNotification(notifications: Notification[], notificationId: string): Notification[] {
    return notifications.filter(notification => notification.id !== notificationId);
  }

  // Get unread count
  getUnreadCount(notifications: Notification[]): number {
    return notifications.filter(notification => !notification.read).length;
  }

  // Sort notifications by priority and time
  sortNotifications(notifications: Notification[]): Notification[] {
    return notifications.sort((a, b) => {
      // Prioritize unread notifications
      if (a.read !== b.read) {
        return a.read ? 1 : -1;
      }

      // Then prioritize by type
      const typePriority = {
        'new_appointment': 1,
        'appointment': 2,
        'reminder': 3,
        'cancellation': 4,
        'reschedule': 5,
        'feedback': 6
      };

      const aPriority = typePriority[a.type] || 10;
      const bPriority = typePriority[b.type] || 10;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Finally, sort by most recent
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });
  }

  // Fetch notifications from database
  async fetchNotifications(filters?: {
    unreadOnly?: boolean;
    limit?: number;
    page?: number;
  }): Promise<Notification[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.unreadOnly) params.append('unreadOnly', 'true');
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.page) params.append('page', filters.page.toString());

      const url = `/notifications${params.toString() ? '?' + params.toString() : ''}`;
      const response = await api.get<ApiResponse<{ notifications: Notification[] }>>(url);
      
      if (response.data.success && response.data.data) {
        return response.data.data.notifications;
      }
      
      return [];
    } catch (error: any) {
      console.error('Fetch notifications error:', error);
      // Fallback to generated notifications if API fails
      return [];
    }
  }

  // Mark notification as read in database
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
    }
  }

  // Mark all notifications as read in database
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await api.put('/notifications/mark-all-read');
    } catch (error: any) {
      console.error('Mark all notifications as read error:', error);
    }
  }

  // Get combined notifications (database + generated)
  async getCombinedNotifications(appointments: Appointment[]): Promise<Notification[]> {
    try {
      // Fetch from database first
      const dbNotifications = await this.fetchNotifications({ limit: 10 });
      
      // Generate real-time notifications from appointments
      const generatedNotifications = this.generateUserNotifications(appointments);
      
      // Combine and deduplicate
      const combined = [...dbNotifications];
      
      // Add generated notifications that don't exist in database
      generatedNotifications.forEach(generated => {
        const exists = dbNotifications.some(db => 
          db.data?.appointmentId === generated.data?.appointmentId && 
          db.type === generated.type
        );
        if (!exists) {
          combined.push(generated);
        }
      });
      
      return this.sortNotifications(combined.slice(0, 10));
    } catch (error: any) {
      console.error('Get combined notifications error:', error);
      // Fallback to generated notifications
      return this.sortNotifications(this.generateUserNotifications(appointments));
    }
  }

  // Get combined notifications for veterinarians (database + generated)
  async getCombinedVeterinarianNotifications(appointments: Appointment[]): Promise<Notification[]> {
    try {
      // Fetch from database first
      const dbNotifications = await this.fetchNotifications({ limit: 10 });
      
      // Generate real-time notifications from appointments
      const generatedNotifications = this.generateVeterinarianNotifications(appointments);
      
      // Combine and deduplicate
      const combined = [...dbNotifications];
      
      // Add generated notifications that don't exist in database
      generatedNotifications.forEach(generated => {
        const exists = dbNotifications.some(db => 
          db.data?.appointmentId === generated.data?.appointmentId && 
          db.type === generated.type
        );
        if (!exists) {
          combined.push(generated);
        }
      });
      
      return this.sortNotifications(combined.slice(0, 10));
    } catch (error: any) {
      console.error('Get combined veterinarian notifications error:', error);
      // Fallback to generated notifications
      return this.sortNotifications(this.generateVeterinarianNotifications(appointments));
    }
  }
}

export default new NotificationService();