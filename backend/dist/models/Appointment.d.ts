import mongoose, { Document, Model } from 'mongoose';
export interface IAppointment extends Document {
    user: mongoose.Types.ObjectId;
    veterinarian: mongoose.Types.ObjectId;
    pet: mongoose.Types.ObjectId;
    date: Date;
    time: string;
    status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
    consultationFee?: number;
    reason: string;
    comments?: string;
    veterinarianNotes?: string;
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
    rating?: number;
    review?: string;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface IAppointmentModel extends Model<IAppointment> {
    findAvailableSlots(veterinarianId: string, date: Date): Promise<string[]>;
}
declare const Appointment: IAppointmentModel;
export default Appointment;
//# sourceMappingURL=Appointment.d.ts.map