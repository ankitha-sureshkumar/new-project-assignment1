export interface INotificationObserver {
    update(event: NotificationEvent): Promise<void>;
    getObserverId(): string;
}
export interface INotificationSubject {
    addObserver(observer: INotificationObserver): void;
    removeObserver(observerId: string): void;
    notifyObservers(event: NotificationEvent): Promise<void>;
}
export interface NotificationEvent {
    type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 'appointment_approved' | 'appointment_rejected' | 'appointment_completed' | 'user_registered' | 'user_blocked' | 'user_unblocked' | 'user_deleted' | 'user_profile_updated' | 'veterinarian_registered' | 'veterinarian_approved' | 'veterinarian_rejected' | 'veterinarian_blocked' | 'veterinarian_unblocked' | 'veterinarian_deleted' | 'veterinarian_profile_updated' | 'admin_login' | 'system_alert';
    data: any;
    timestamp: Date;
    userId?: string;
    veterinarianId?: string;
    appointmentId?: string;
    adminId?: string;
    reason?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}
export declare class NotificationCenter implements INotificationSubject {
    private static instance;
    private observers;
    private constructor();
    static getInstance(): NotificationCenter;
    addObserver(observer: INotificationObserver): void;
    removeObserver(observerId: string): void;
    notifyObservers(event: NotificationEvent): Promise<void>;
    publishAppointmentEvent(type: 'appointment_created' | 'appointment_updated' | 'appointment_cancelled' | 'appointment_approved' | 'appointment_rejected' | 'appointment_completed', appointmentData: any): Promise<void>;
    publishUserEvent(type: 'user_registered' | 'user_blocked' | 'user_unblocked' | 'user_deleted' | 'user_profile_updated' | 'veterinarian_registered' | 'veterinarian_approved' | 'veterinarian_rejected' | 'veterinarian_blocked' | 'veterinarian_unblocked' | 'veterinarian_deleted' | 'veterinarian_profile_updated', userData: any, adminId?: string, reason?: string): Promise<void>;
    publishAdminEvent(type: 'admin_login', adminData: any): Promise<void>;
    private getPriorityByType;
}
export declare class EmailNotificationObserver implements INotificationObserver {
    private observerId;
    private emailService;
    constructor(emailService: EmailService);
    getObserverId(): string;
    update(event: NotificationEvent): Promise<void>;
    private generateEmailContent;
    private createAppointmentCreatedEmail;
    private createAppointmentApprovedEmail;
    private createAppointmentCancelledEmail;
    private createAppointmentCompletedEmail;
    private createVeterinarianApprovedEmail;
}
export declare class DatabaseNotificationObserver implements INotificationObserver {
    private observerId;
    constructor();
    getObserverId(): string;
    update(event: NotificationEvent): Promise<void>;
    private createNotificationRecords;
    private shouldNotifyUser;
    private shouldNotifyVeterinarian;
    private generateUserTitle;
    private generateVeterinarianTitle;
    private mapEventTypeToDbType;
    private generateUserMessage;
    private generateVeterinarianMessage;
}
export declare class PushNotificationObserver implements INotificationObserver {
    private observerId;
    private pushService;
    constructor(pushService: PushNotificationService);
    getObserverId(): string;
    update(event: NotificationEvent): Promise<void>;
    private generatePushContent;
}
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
export declare class EmailService {
    sendEmail(content: EmailContent): Promise<void>;
}
export declare class PushNotificationService {
    sendPushNotification(content: PushNotificationContent): Promise<void>;
}
export declare class NotificationManager {
    private notificationCenter;
    private observers;
    constructor();
    private setupDefaultObservers;
    addObserver(observer: INotificationObserver): void;
    removeObserver(observerId: string): void;
    onAppointmentCreated(appointmentData: any): Promise<void>;
    onAppointmentApproved(appointmentData: any): Promise<void>;
    onAppointmentCancelled(appointmentData: any): Promise<void>;
    onAppointmentCompleted(appointmentData: any): Promise<void>;
    onAppointmentRejected(appointmentData: any): Promise<void>;
    onVeterinarianApproved(vetData: any): Promise<void>;
    onVeterinarianRejected(vetData: any): Promise<void>;
    onUserRegistered(userData: any): Promise<void>;
    onUserBlocked(userData: any, reason: string, adminId: string): Promise<void>;
    onUserUnblocked(userData: any, adminId: string): Promise<void>;
    onUserDeleted(userData: any, adminId: string): Promise<void>;
    onUserProfileUpdated(userData: any, adminId: string): Promise<void>;
    onVeterinarianRegistered(vetData: any): Promise<void>;
    onVeterinarianBlocked(vetData: any, reason: string, adminId: string): Promise<void>;
    onVeterinarianUnblocked(vetData: any, adminId: string): Promise<void>;
    onVeterinarianDeleted(vetData: any, adminId: string): Promise<void>;
    onVeterinarianProfileUpdated(vetData: any, adminId: string): Promise<void>;
    onAdminLogin(adminData: any): Promise<void>;
}
//# sourceMappingURL=NotificationObserver.d.ts.map