import { IAppointment } from '../models/Appointment';
export interface IAppointmentRepository {
    findByUser(userId: string): Promise<IAppointment[]>;
    findByVeterinarian(vetId: string): Promise<IAppointment[]>;
    findByIdForRole(appointmentId: string, userId: string, role: 'user' | 'veterinarian'): Promise<IAppointment | null>;
    findConflict(vetId: string, date: Date, time: string, excludeId?: string): Promise<IAppointment | null>;
    create(data: Partial<IAppointment>): Promise<IAppointment>;
    updateById(id: string, patch: Partial<IAppointment>): Promise<IAppointment | null>;
}
export declare class AppointmentRepository implements IAppointmentRepository {
    findByUser(userId: string): Promise<IAppointment[]>;
    findByVeterinarian(vetId: string): Promise<IAppointment[]>;
    findByIdForRole(appointmentId: string, userId: string, role: 'user' | 'veterinarian'): Promise<IAppointment | null>;
    findConflict(vetId: string, date: Date, time: string, excludeId?: string): Promise<IAppointment | null>;
    create(data: Partial<IAppointment>): Promise<IAppointment>;
    updateById(id: string, patch: Partial<IAppointment>): Promise<IAppointment | null>;
}
//# sourceMappingURL=AppointmentRepository.d.ts.map