/**
 * Observer Pattern Implementation
 * Notification system for appointment updates and status changes
 */

// Observer interface
export interface INotificationObserver {
  update(event: NotificationEvent): Promise<void>;
  getObserverId(): string;
}

// Subject interface
export interface INotificationSubject {
  addObserver(observer: INotificationObserver): void;
  removeObserver(observerId: string): void;
  notifyObservers(event: NotificationEvent): Promise<void>;
}

// Event data structure
export interface NotificationEvent {
  type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 
        'appointment_approved' | 'appointment_rejected' | 'appointment_completed' |
        'user_registered' | 'user_blocked' | 'user_unblocked' | 'user_deleted' | 'user_profile_updated' |
        'veterinarian_registered' | 'veterinarian_approved' | 'veterinarian_rejected' | 
        'veterinarian_blocked' | 'veterinarian_unblocked' | 'veterinarian_deleted' | 'veterinarian_profile_updated' |
        'admin_login' | 'system_alert';
  data: any;
  timestamp: Date;
  userId?: string;
  veterinarianId?: string;
  appointmentId?: string;
  adminId?: string;
  reason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Concrete implementation of notification subject (Publisher)
export class NotificationCenter implements INotificationSubject {
  private static instance: NotificationCenter;
  private observers: Map<string, INotificationObserver>;

  private constructor() {
    this.observers = new Map();
  }

  // Singleton pattern for global notification center
  static getInstance(): NotificationCenter {
    if (!NotificationCenter.instance) {
      NotificationCenter.instance = new NotificationCenter();
    }
    return NotificationCenter.instance;
  }

  addObserver(observer: INotificationObserver): void {
    this.observers.set(observer.getObserverId(), observer);
  }

  removeObserver(observerId: string): void {
    if (this.observers.has(observerId)) {
      this.observers.delete(observerId);
    }
  }

  async notifyObservers(event: NotificationEvent): Promise<void> {
    const notifications = Array.from(this.observers.values()).map(observer => 
      observer.update(event).catch(error => {
        // Silent error handling - errors are handled gracefully
      })
    );

    await Promise.allSettled(notifications);
  }

  // Convenience methods for different types of events
  async publishAppointmentEvent(
    type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 
          'appointment_approved' | 'appointment_rejected' | 'appointment_completed',
    appointmentData: any
  ): Promise<void> {
    const event: NotificationEvent = {
      type,
      data: appointmentData,
      timestamp: new Date(),
      appointmentId: appointmentData._id,
      userId: appointmentData.user,
      veterinarianId: appointmentData.veterinarian,
      priority: this.getPriorityByType(type)
    };

    await this.notifyObservers(event);
  }

  async publishUserEvent(
    type: 'user_registered' | 'user_blocked' | 'user_unblocked' | 'user_deleted' | 'user_profile_updated' |
         'veterinarian_registered' | 'veterinarian_approved' | 'veterinarian_rejected' | 
         'veterinarian_blocked' | 'veterinarian_unblocked' | 'veterinarian_deleted' | 'veterinarian_profile_updated',
    userData: any,
    adminId?: string,
    reason?: string
  ): Promise<void> {
    const event: NotificationEvent = {
      type,
      data: userData,
      timestamp: new Date(),
      userId: userData._id,
      veterinarianId: type.includes('veterinarian') ? userData._id : undefined,
      adminId,
      reason,
      priority: this.getPriorityByType(type)
    };

    await this.notifyObservers(event);
  }

  async publishAdminEvent(
    type: 'admin_login',
    adminData: any
  ): Promise<void> {
    const event: NotificationEvent = {
      type,
      data: adminData,
      timestamp: new Date(),
      adminId: adminData._id,
      priority: 'medium'
    };

    await this.notifyObservers(event);
  }

  private getPriorityByType(type: string): 'low' | 'medium' | 'high' | 'urgent' {
    const priorityMap: { [key: string]: 'low' | 'medium' | 'high' | 'urgent' } = {
      appointment_created: 'medium',
      appointment_updated: 'medium',
      appointment_cancelled: 'high',
      appointment_approved: 'high',
      appointment_rejected: 'high',
      appointment_completed: 'low',
      user_registered: 'low',
      user_blocked: 'high',
      user_unblocked: 'medium',
      user_deleted: 'high',
      user_profile_updated: 'low',
      veterinarian_registered: 'low',
      veterinarian_approved: 'medium',
      veterinarian_rejected: 'medium',
      veterinarian_blocked: 'high',
      veterinarian_unblocked: 'medium',
      veterinarian_deleted: 'high',
      veterinarian_profile_updated: 'low',
      admin_login: 'medium',
      system_alert: 'urgent'
    };

    return priorityMap[type] || 'low';
  }
}

// Concrete observer for email notifications
export class EmailNotificationObserver implements INotificationObserver {
  private observerId: string;
  private emailService: EmailService;

  constructor(emailService: EmailService) {
    this.observerId = `email_observer_${Date.now()}`;
    this.emailService = emailService;
  }

  getObserverId(): string {
    return this.observerId;
  }

  async update(event: NotificationEvent): Promise<void> {
    try {
      const emailContent = this.generateEmailContent(event);
      if (emailContent) {
        await this.emailService.sendEmail(emailContent);
        console.log(`Email notification sent for event: ${event.type}`);
      }
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  private generateEmailContent(event: NotificationEvent): EmailContent | null {
    switch (event.type) {
      case 'appointment_created':
        return this.createAppointmentCreatedEmail(event);
      case 'appointment_approved':
        return this.createAppointmentApprovedEmail(event);
      case 'appointment_cancelled':
        return this.createAppointmentCancelledEmail(event);
      case 'appointment_completed':
        return this.createAppointmentCompletedEmail(event);
      case 'veterinarian_approved':
        return this.createVeterinarianApprovedEmail(event);
      default:
        return null;
    }
  }

  private createAppointmentCreatedEmail(event: NotificationEvent): EmailContent {
    return {
      to: event.data.user.email,
      subject: 'Appointment Request Received',
      html: `
        <h2>Appointment Request Confirmation</h2>
        <p>Dear ${event.data.user.name},</p>
        <p>Your appointment request has been received and is pending veterinarian approval.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Date: ${new Date(event.data.date).toLocaleDateString()}</li>
          <li>Time: ${event.data.time}</li>
          <li>Veterinarian: ${event.data.veterinarian.name}</li>
          <li>Pet: ${event.data.pet.name}</li>
        </ul>
        <p>You will receive another notification once the veterinarian reviews your request.</p>
      `,
      priority: event.priority
    };
  }

  private createAppointmentApprovedEmail(event: NotificationEvent): EmailContent {
    return {
      to: event.data.user.email,
      subject: 'Appointment Approved!',
      html: `
        <h2>Great News! Your Appointment is Approved</h2>
        <p>Dear ${event.data.user.name},</p>
        <p>Your appointment has been approved by ${event.data.veterinarian.name}.</p>
        <p><strong>Confirmed Details:</strong></p>
        <ul>
          <li>Date: ${new Date(event.data.date).toLocaleDateString()}</li>
          <li>Time: ${event.data.time}</li>
          <li>Consultation Fee: $${event.data.consultationFee}</li>
          <li>Pet: ${event.data.pet.name}</li>
        </ul>
        <p>Please arrive 15 minutes early for check-in.</p>
      `,
      priority: event.priority
    };
  }

  private createAppointmentCancelledEmail(event: NotificationEvent): EmailContent {
    return {
      to: event.data.user.email,
      subject: 'Appointment Cancelled',
      html: `
        <h2>Appointment Cancellation Notice</h2>
        <p>Dear ${event.data.user.name},</p>
        <p>Your appointment scheduled for ${new Date(event.data.date).toLocaleDateString()} at ${event.data.time} has been cancelled.</p>
        <p>If you need to reschedule, please contact us or book a new appointment through our platform.</p>
      `,
      priority: event.priority
    };
  }

  private createAppointmentCompletedEmail(event: NotificationEvent): EmailContent {
    return {
      to: event.data.user.email,
      subject: 'Appointment Summary',
      html: `
        <h2>Appointment Completed</h2>
        <p>Dear ${event.data.user.name},</p>
        <p>Thank you for visiting ${event.data.veterinarian.name} today.</p>
        <p><strong>Visit Summary:</strong></p>
        <ul>
          <li>Pet: ${event.data.pet.name}</li>
          <li>Diagnosis: ${event.data.diagnosis || 'See attached notes'}</li>
          <li>Treatment: ${event.data.treatment || 'See attached notes'}</li>
        </ul>
        ${event.data.followUpRequired ? '<p><strong>Follow-up required:</strong> Please schedule a follow-up appointment.</p>' : ''}
        <p>Please rate your experience to help us improve our services.</p>
      `,
      priority: event.priority
    };
  }

  private createVeterinarianApprovedEmail(event: NotificationEvent): EmailContent {
    return {
      to: event.data.email,
      subject: 'Welcome! Your Veterinarian Account is Approved',
      html: `
        <h2>Congratulations! Your Account is Approved</h2>
        <p>Dear Dr. ${event.data.name},</p>
        <p>Welcome to Oggy's Pet Hospital platform! Your veterinarian account has been approved.</p>
        <p>You can now:</p>
        <ul>
          <li>Login to your dashboard</li>
          <li>Manage your availability</li>
          <li>Accept appointment requests</li>
          <li>Access patient records</li>
        </ul>
        <p>We're excited to have you on board!</p>
      `,
      priority: event.priority
    };
  }
}

// Concrete observer for database notifications
export class DatabaseNotificationObserver implements INotificationObserver {
  private observerId: string;

  constructor() {
    this.observerId = `db_observer_${Date.now()}`;
  }

  getObserverId(): string {
    return this.observerId;
  }

  async update(event: NotificationEvent): Promise<void> {
    try {
      // Import the Notification model dynamically to avoid circular dependencies
      const Notification = (await import('../models/Notification')).default;
      
      // Create separate notifications for users and veterinarians based on event type
      const notifications = await this.createNotificationRecords(event);
      
      for (const notificationData of notifications) {
        const notification = new Notification(notificationData);
        await notification.save();
        console.log(`Database notification created:`, notification._id);
      }
      
    } catch (error) {
      console.error('Failed to create database notification:', error);
    }
  }

  private async createNotificationRecords(event: NotificationEvent): Promise<any[]> {
    const notifications: any[] = [];
    
    // Create user notification (for appointment events that affect users)
    if (event.userId && this.shouldNotifyUser(event.type)) {
      notifications.push({
        recipient: event.userId,
        type: this.mapEventTypeToDbType(event.type),
        title: this.generateUserTitle(event),
        message: this.generateUserMessage(event),
        relatedAppointment: event.appointmentId,
        relatedUser: event.veterinarianId,
        priority: event.priority === 'urgent' ? 'high' : event.priority,
        read: false,
        createdAt: event.timestamp
      });
    }
    
    // Create veterinarian notification (for appointment events that affect veterinarians)
    if (event.veterinarianId && this.shouldNotifyVeterinarian(event.type)) {
      notifications.push({
        recipient: event.veterinarianId,
        type: this.mapEventTypeToDbType(event.type),
        title: this.generateVeterinarianTitle(event),
        message: this.generateVeterinarianMessage(event),
        relatedAppointment: event.appointmentId,
        relatedUser: event.userId,
        priority: event.priority === 'urgent' ? 'high' : event.priority,
        read: false,
        createdAt: event.timestamp
      });
    }
    
    return notifications;
  }

  private shouldNotifyUser(eventType: string): boolean {
    const userNotificationTypes = [
      'appointment_approved', 'appointment_rejected', 'appointment_cancelled',
      'appointment_completed', 'appointment_updated'
    ];
    return userNotificationTypes.includes(eventType);
  }

  private shouldNotifyVeterinarian(eventType: string): boolean {
    const vetNotificationTypes = [
      'appointment_created', 'appointment_cancelled', 'appointment_updated'
    ];
    return vetNotificationTypes.includes(eventType);
  }

  private generateUserTitle(event: NotificationEvent): string {
    const titles: { [key: string]: string } = {
      appointment_approved: 'Appointment Approved',
      appointment_rejected: 'Appointment Rejected',
      appointment_cancelled: 'Appointment Cancelled',
      appointment_completed: 'Appointment Completed',
      appointment_updated: 'Appointment Updated'
    };
    return titles[event.type] || 'Notification';
  }

  private generateVeterinarianTitle(event: NotificationEvent): string {
    const titles: { [key: string]: string } = {
      appointment_created: 'New Appointment Request',
      appointment_cancelled: 'Appointment Cancelled by User',
      appointment_updated: 'Appointment Updated by User'
    };
    return titles[event.type] || 'Notification';
  }

  private mapEventTypeToDbType(eventType: string): string {
    const typeMap: { [key: string]: string } = {
      appointment_created: 'appointment_request',
      appointment_updated: 'appointment_request',
      appointment_approved: 'appointment_approved',
      appointment_confirmed: 'appointment_confirmed',
      appointment_completed: 'appointment_completed',
      appointment_cancelled: 'appointment_cancelled',
      appointment_rejected: 'appointment_rejected'
    };
    return typeMap[eventType] || 'system';
  }

  private generateUserMessage(event: NotificationEvent): string {
    switch (event.type) {
      case 'appointment_approved':
        return `Your appointment with Dr. ${event.data.veterinarian?.name || 'Veterinarian'} has been approved for ${new Date(event.data.date).toLocaleDateString()}`;
      case 'appointment_rejected':
        return `Your appointment request for ${new Date(event.data.date).toLocaleDateString()} has been rejected`;
      case 'appointment_cancelled':
        return `Your appointment scheduled for ${new Date(event.data.date).toLocaleDateString()} has been cancelled`;
      case 'appointment_completed':
        return `Your appointment with Dr. ${event.data.veterinarian?.name || 'Veterinarian'} has been completed`;
      case 'appointment_updated':
        return `Your appointment details have been updated`;
      default:
        return 'You have a new notification';
    }
  }

  private generateVeterinarianMessage(event: NotificationEvent): string {
    switch (event.type) {
      case 'appointment_created':
        return `New appointment request from ${event.data.user?.name || 'User'} for ${event.data.pet?.name || 'pet'} on ${new Date(event.data.date).toLocaleDateString()}`;
      case 'appointment_cancelled':
        return `${event.data.user?.name || 'User'} cancelled their appointment scheduled for ${new Date(event.data.date).toLocaleDateString()}`;
      case 'appointment_updated':
        return `${event.data.user?.name || 'User'} updated their appointment details`;
      default:
        return 'You have a new notification';
    }
  }
}

// Concrete observer for push notifications
export class PushNotificationObserver implements INotificationObserver {
  private observerId: string;
  private pushService: PushNotificationService;

  constructor(pushService: PushNotificationService) {
    this.observerId = `push_observer_${Date.now()}`;
    this.pushService = pushService;
  }

  getObserverId(): string {
    return this.observerId;
  }

  async update(event: NotificationEvent): Promise<void> {
    try {
      // Only send push notifications for high priority events
      if (event.priority === 'high' || event.priority === 'urgent') {
        const pushContent = this.generatePushContent(event);
        if (pushContent) {
          await this.pushService.sendPushNotification(pushContent);
          console.log(`Push notification sent for event: ${event.type}`);
        }
      }
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  private generatePushContent(event: NotificationEvent): PushNotificationContent | null {
    switch (event.type) {
      case 'appointment_approved':
        return {
          userId: event.userId!,
          title: 'Appointment Approved!',
          body: `Your appointment with ${event.data.veterinarian.name} has been confirmed`,
          data: { appointmentId: event.appointmentId }
        };
      case 'appointment_cancelled':
        return {
          userId: event.userId!,
          title: 'Appointment Cancelled',
          body: 'Your upcoming appointment has been cancelled',
          data: { appointmentId: event.appointmentId }
        };
      default:
        return null;
    }
  }
}

// Service interfaces (would be implemented elsewhere)
export interface EmailContent {
  to: string;
  subject: string;
  html: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface PushNotificationContent {
  userId: string;
  title: string;
  body: string;
  data?: any;
}

export class EmailService {
  async sendEmail(content: EmailContent): Promise<void> {
    // Implementation would integrate with email provider (SendGrid, etc.)
    console.log(`Sending email to ${content.to}: ${content.subject}`);
  }
}

export class PushNotificationService {
  async sendPushNotification(content: PushNotificationContent): Promise<void> {
    // Implementation would integrate with push service (Firebase, etc.)
    console.log(`Sending push to user ${content.userId}: ${content.title}`);
  }
}

// Notification manager to set up and manage observers
export class NotificationManager {
  private notificationCenter: NotificationCenter;
  private observers: INotificationObserver[];

  constructor() {
    this.notificationCenter = NotificationCenter.getInstance();
    this.observers = [];
    this.setupDefaultObservers();
  }

  private setupDefaultObservers(): void {
    // Set up default observers
    const emailService = new EmailService();
    const pushService = new PushNotificationService();

    const emailObserver = new EmailNotificationObserver(emailService);
    const dbObserver = new DatabaseNotificationObserver();
    const pushObserver = new PushNotificationObserver(pushService);

    this.addObserver(emailObserver);
    this.addObserver(dbObserver);
    this.addObserver(pushObserver);
  }

  addObserver(observer: INotificationObserver): void {
    this.observers.push(observer);
    this.notificationCenter.addObserver(observer);
  }

  removeObserver(observerId: string): void {
    this.observers = this.observers.filter(obs => obs.getObserverId() !== observerId);
    this.notificationCenter.removeObserver(observerId);
  }

  // Convenience methods for publishing events
  async onAppointmentCreated(appointmentData: any): Promise<void> {
    await this.notificationCenter.publishAppointmentEvent('appointment_created', appointmentData);
  }

  async onAppointmentApproved(appointmentData: any): Promise<void> {
    await this.notificationCenter.publishAppointmentEvent('appointment_approved', appointmentData);
  }

  async onAppointmentCancelled(appointmentData: any): Promise<void> {
    await this.notificationCenter.publishAppointmentEvent('appointment_cancelled', appointmentData);
  }

  async onAppointmentCompleted(appointmentData: any): Promise<void> {
    await this.notificationCenter.publishAppointmentEvent('appointment_completed', appointmentData);
  }

  async onAppointmentRejected(appointmentData: any): Promise<void> {
    await this.notificationCenter.publishAppointmentEvent('appointment_rejected', appointmentData);
  }

  async onAppointmentUpdated(appointmentData: any): Promise<void> {
    await this.notificationCenter.publishAppointmentEvent('appointment_updated', appointmentData);
  }

  async onVeterinarianApproved(vetData: any): Promise<void> {
    await this.notificationCenter.publishUserEvent('veterinarian_approved', vetData);
  }

  async onVeterinarianRejected(vetData: any): Promise<void> {
    await this.notificationCenter.publishUserEvent('veterinarian_rejected', vetData);
  }

  // User-related notification methods
  async onUserRegistered(userData: any): Promise<void> {
    await this.notificationCenter.publishUserEvent('user_registered', userData);
  }

  async onUserBlocked(userData: any, reason: string, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('user_blocked', userData, adminId, reason);
  }

  async onUserUnblocked(userData: any, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('user_unblocked', userData, adminId);
  }

  async onUserDeleted(userData: any, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('user_deleted', userData, adminId);
  }

  async onUserProfileUpdated(userData: any, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('user_profile_updated', userData, adminId);
  }

  // Veterinarian-related notification methods
  async onVeterinarianRegistered(vetData: any): Promise<void> {
    await this.notificationCenter.publishUserEvent('veterinarian_registered', vetData);
  }

  async onVeterinarianBlocked(vetData: any, reason: string, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('veterinarian_blocked', vetData, adminId, reason);
  }

  async onVeterinarianUnblocked(vetData: any, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('veterinarian_unblocked', vetData, adminId);
  }

  async onVeterinarianDeleted(vetData: any, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('veterinarian_deleted', vetData, adminId);
  }

  async onVeterinarianProfileUpdated(vetData: any, adminId: string): Promise<void> {
    await this.notificationCenter.publishUserEvent('veterinarian_profile_updated', vetData, adminId);
  }

  // Admin-related notification methods
  async onAdminLogin(adminData: any): Promise<void> {
    await this.notificationCenter.publishAdminEvent('admin_login', adminData);
  }
}

// All classes are already individually exported above
