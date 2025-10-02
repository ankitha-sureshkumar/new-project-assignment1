import { Response } from 'express';
import { INotification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';
export declare class NotificationController {
    getUserNotifications(req: AuthRequest, res: Response): Promise<void>;
    markNotificationAsRead(req: AuthRequest, res: Response): Promise<void>;
    markAllNotificationsAsRead(req: AuthRequest, res: Response): Promise<void>;
    getUnreadCount(req: AuthRequest, res: Response): Promise<void>;
    deleteNotification(req: AuthRequest, res: Response): Promise<void>;
    createNotification(data: {
        recipient: string;
        type: string;
        title: string;
        message: string;
        relatedAppointment?: string;
        relatedUser?: string;
        priority?: 'low' | 'medium' | 'high';
    }): Promise<INotification | null>;
}
declare const _default: NotificationController;
export default _default;
//# sourceMappingURL=NotificationController.d.ts.map