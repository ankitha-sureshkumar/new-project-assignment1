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
exports.NotificationManager = exports.PushNotificationService = exports.EmailService = exports.PushNotificationObserver = exports.DatabaseNotificationObserver = exports.EmailNotificationObserver = exports.NotificationCenter = void 0;
class NotificationCenter {
    constructor() {
        this.observers = new Map();
    }
    static getInstance() {
        if (!NotificationCenter.instance) {
            NotificationCenter.instance = new NotificationCenter();
        }
        return NotificationCenter.instance;
    }
    addObserver(observer) {
        this.observers.set(observer.getObserverId(), observer);
    }
    removeObserver(observerId) {
        if (this.observers.has(observerId)) {
            this.observers.delete(observerId);
        }
    }
    async notifyObservers(event) {
        const notifications = Array.from(this.observers.values()).map(observer => observer.update(event).catch(error => {
        }));
        await Promise.allSettled(notifications);
    }
    async publishAppointmentEvent(type, appointmentData) {
        const event = {
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
    async publishUserEvent(type, userData, adminId, reason) {
        const event = {
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
    async publishAdminEvent(type, adminData) {
        const event = {
            type,
            data: adminData,
            timestamp: new Date(),
            adminId: adminData._id,
            priority: 'medium'
        };
        await this.notifyObservers(event);
    }
    getPriorityByType(type) {
        const priorityMap = {
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
exports.NotificationCenter = NotificationCenter;
class EmailNotificationObserver {
    constructor(emailService) {
        this.observerId = `email_observer_${Date.now()}`;
        this.emailService = emailService;
    }
    getObserverId() {
        return this.observerId;
    }
    async update(event) {
        try {
            const emailContent = this.generateEmailContent(event);
            if (emailContent) {
                await this.emailService.sendEmail(emailContent);
                console.log(`Email notification sent for event: ${event.type}`);
            }
        }
        catch (error) {
            console.error('Failed to send email notification:', error);
        }
    }
    generateEmailContent(event) {
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
    createAppointmentCreatedEmail(event) {
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
    createAppointmentApprovedEmail(event) {
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
    createAppointmentCancelledEmail(event) {
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
    createAppointmentCompletedEmail(event) {
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
    createVeterinarianApprovedEmail(event) {
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
exports.EmailNotificationObserver = EmailNotificationObserver;
class DatabaseNotificationObserver {
    constructor() {
        this.observerId = `db_observer_${Date.now()}`;
    }
    getObserverId() {
        return this.observerId;
    }
    async update(event) {
        try {
            const Notification = (await Promise.resolve().then(() => __importStar(require('../models/Notification')))).default;
            const notifications = await this.createNotificationRecords(event);
            for (const notificationData of notifications) {
                const notification = new Notification(notificationData);
                await notification.save();
                console.log(`Database notification created:`, notification._id);
            }
        }
        catch (error) {
            console.error('Failed to create database notification:', error);
        }
    }
    async createNotificationRecords(event) {
        const notifications = [];
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
    shouldNotifyUser(eventType) {
        const userNotificationTypes = [
            'appointment_approved', 'appointment_rejected', 'appointment_cancelled',
            'appointment_completed', 'appointment_updated'
        ];
        return userNotificationTypes.includes(eventType);
    }
    shouldNotifyVeterinarian(eventType) {
        const vetNotificationTypes = [
            'appointment_created', 'appointment_cancelled', 'appointment_updated'
        ];
        return vetNotificationTypes.includes(eventType);
    }
    generateUserTitle(event) {
        const titles = {
            appointment_approved: 'Appointment Approved',
            appointment_rejected: 'Appointment Rejected',
            appointment_cancelled: 'Appointment Cancelled',
            appointment_completed: 'Appointment Completed',
            appointment_updated: 'Appointment Updated'
        };
        return titles[event.type] || 'Notification';
    }
    generateVeterinarianTitle(event) {
        const titles = {
            appointment_created: 'New Appointment Request',
            appointment_cancelled: 'Appointment Cancelled by User',
            appointment_updated: 'Appointment Updated by User'
        };
        return titles[event.type] || 'Notification';
    }
    mapEventTypeToDbType(eventType) {
        const typeMap = {
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
    generateUserMessage(event) {
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
    generateVeterinarianMessage(event) {
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
exports.DatabaseNotificationObserver = DatabaseNotificationObserver;
class PushNotificationObserver {
    constructor(pushService) {
        this.observerId = `push_observer_${Date.now()}`;
        this.pushService = pushService;
    }
    getObserverId() {
        return this.observerId;
    }
    async update(event) {
        try {
            if (event.priority === 'high' || event.priority === 'urgent') {
                const pushContent = this.generatePushContent(event);
                if (pushContent) {
                    await this.pushService.sendPushNotification(pushContent);
                    console.log(`Push notification sent for event: ${event.type}`);
                }
            }
        }
        catch (error) {
            console.error('Failed to send push notification:', error);
        }
    }
    generatePushContent(event) {
        switch (event.type) {
            case 'appointment_approved':
                return {
                    userId: event.userId,
                    title: 'Appointment Approved!',
                    body: `Your appointment with ${event.data.veterinarian.name} has been confirmed`,
                    data: { appointmentId: event.appointmentId }
                };
            case 'appointment_cancelled':
                return {
                    userId: event.userId,
                    title: 'Appointment Cancelled',
                    body: 'Your upcoming appointment has been cancelled',
                    data: { appointmentId: event.appointmentId }
                };
            default:
                return null;
        }
    }
}
exports.PushNotificationObserver = PushNotificationObserver;
class EmailService {
    async sendEmail(content) {
        console.log(`Sending email to ${content.to}: ${content.subject}`);
    }
}
exports.EmailService = EmailService;
class PushNotificationService {
    async sendPushNotification(content) {
        console.log(`Sending push to user ${content.userId}: ${content.title}`);
    }
}
exports.PushNotificationService = PushNotificationService;
class NotificationManager {
    constructor() {
        this.notificationCenter = NotificationCenter.getInstance();
        this.observers = [];
        this.setupDefaultObservers();
    }
    setupDefaultObservers() {
        const emailService = new EmailService();
        const pushService = new PushNotificationService();
        const emailObserver = new EmailNotificationObserver(emailService);
        const dbObserver = new DatabaseNotificationObserver();
        const pushObserver = new PushNotificationObserver(pushService);
        this.addObserver(emailObserver);
        this.addObserver(dbObserver);
        this.addObserver(pushObserver);
    }
    addObserver(observer) {
        this.observers.push(observer);
        this.notificationCenter.addObserver(observer);
    }
    removeObserver(observerId) {
        this.observers = this.observers.filter(obs => obs.getObserverId() !== observerId);
        this.notificationCenter.removeObserver(observerId);
    }
    async onAppointmentCreated(appointmentData) {
        await this.notificationCenter.publishAppointmentEvent('appointment_created', appointmentData);
    }
    async onAppointmentApproved(appointmentData) {
        await this.notificationCenter.publishAppointmentEvent('appointment_approved', appointmentData);
    }
    async onAppointmentCancelled(appointmentData) {
        await this.notificationCenter.publishAppointmentEvent('appointment_cancelled', appointmentData);
    }
    async onAppointmentCompleted(appointmentData) {
        await this.notificationCenter.publishAppointmentEvent('appointment_completed', appointmentData);
    }
    async onAppointmentRejected(appointmentData) {
        await this.notificationCenter.publishAppointmentEvent('appointment_rejected', appointmentData);
    }
    async onAppointmentUpdated(appointmentData) {
        await this.notificationCenter.publishAppointmentEvent('appointment_updated', appointmentData);
    }
    async onVeterinarianApproved(vetData) {
        await this.notificationCenter.publishUserEvent('veterinarian_approved', vetData);
    }
    async onVeterinarianRejected(vetData) {
        await this.notificationCenter.publishUserEvent('veterinarian_rejected', vetData);
    }
    async onUserRegistered(userData) {
        await this.notificationCenter.publishUserEvent('user_registered', userData);
    }
    async onUserBlocked(userData, reason, adminId) {
        await this.notificationCenter.publishUserEvent('user_blocked', userData, adminId, reason);
    }
    async onUserUnblocked(userData, adminId) {
        await this.notificationCenter.publishUserEvent('user_unblocked', userData, adminId);
    }
    async onUserDeleted(userData, adminId) {
        await this.notificationCenter.publishUserEvent('user_deleted', userData, adminId);
    }
    async onUserProfileUpdated(userData, adminId) {
        await this.notificationCenter.publishUserEvent('user_profile_updated', userData, adminId);
    }
    async onVeterinarianRegistered(vetData) {
        await this.notificationCenter.publishUserEvent('veterinarian_registered', vetData);
    }
    async onVeterinarianBlocked(vetData, reason, adminId) {
        await this.notificationCenter.publishUserEvent('veterinarian_blocked', vetData, adminId, reason);
    }
    async onVeterinarianUnblocked(vetData, adminId) {
        await this.notificationCenter.publishUserEvent('veterinarian_unblocked', vetData, adminId);
    }
    async onVeterinarianDeleted(vetData, adminId) {
        await this.notificationCenter.publishUserEvent('veterinarian_deleted', vetData, adminId);
    }
    async onVeterinarianProfileUpdated(vetData, adminId) {
        await this.notificationCenter.publishUserEvent('veterinarian_profile_updated', vetData, adminId);
    }
    async onAdminLogin(adminData) {
        await this.notificationCenter.publishAdminEvent('admin_login', adminData);
    }
}
exports.NotificationManager = NotificationManager;
//# sourceMappingURL=NotificationObserver.js.map