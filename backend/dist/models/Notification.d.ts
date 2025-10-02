import mongoose, { Document } from 'mongoose';
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
declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Notification;
//# sourceMappingURL=Notification.d.ts.map