import { AppointmentState, RescheduleContext } from './AppointmentState';
export declare class ConfirmedState extends AppointmentState {
    name(): string;
    complete(ctx: {
        diagnosis: string;
        treatment: string;
        followUpRequired?: boolean;
        veterinarianNotes?: string;
    }): Promise<import("../../../models/Appointment").IAppointment>;
    cancel(reason?: string): Promise<import("../../../models/Appointment").IAppointment>;
    reschedule(ctx: RescheduleContext): Promise<import("../../../models/Appointment").IAppointment>;
}
//# sourceMappingURL=ConfirmedState.d.ts.map