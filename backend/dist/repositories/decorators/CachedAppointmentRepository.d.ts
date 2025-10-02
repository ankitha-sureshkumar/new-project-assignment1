import { AppointmentRepository, IAppointmentRepository } from '../AppointmentRepository';
import { IAppointment } from '../../models/Appointment';
export declare class CachedAppointmentRepository implements IAppointmentRepository {
    private cache;
    private ttlMs;
    private repo;
    constructor(repo?: AppointmentRepository);
    private key;
    findByUser(userId: string): Promise<IAppointment[]>;
    findByVeterinarian(vetId: string): Promise<IAppointment[]>;
    findByIdForRole(appointmentId: string, userId: string, role: 'user' | 'veterinarian'): Promise<IAppointment | null>;
    findConflict(vetId: string, date: Date, time: string, excludeId?: string): Promise<IAppointment | null>;
    create(data: Partial<IAppointment>): Promise<IAppointment>;
    updateById(id: string, patch: Partial<IAppointment>): Promise<IAppointment | null>;
}
//# sourceMappingURL=CachedAppointmentRepository.d.ts.map