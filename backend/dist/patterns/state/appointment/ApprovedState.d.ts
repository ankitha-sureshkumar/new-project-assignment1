import { AppointmentState, RescheduleContext } from './AppointmentState';
export declare class ApprovedState extends AppointmentState {
    name(): string;
    confirm(): Promise<import("../../../models/Appointment").IAppointment>;
    cancel(reason?: string): Promise<import("../../../models/Appointment").IAppointment>;
    reschedule(ctx: RescheduleContext): Promise<import("../../../models/Appointment").IAppointment>;
    complete(ctx: {
        diagnosis: string;
        treatment: string;
        followUpRequired?: boolean;
        veterinarianNotes?: string;
    }): Promise<import("../../../models/Appointment").IAppointment>;
}
//# sourceMappingURL=ApprovedState.d.ts.map