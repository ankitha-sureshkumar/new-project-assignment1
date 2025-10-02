import { AppointmentState, TransitionContext, RescheduleContext } from './AppointmentState';
export declare class PendingState extends AppointmentState {
    name(): string;
    approve(ctx: TransitionContext): Promise<import("../../../models/Appointment").IAppointment>;
    reschedule(ctx: RescheduleContext): Promise<import("../../../models/Appointment").IAppointment>;
}
//# sourceMappingURL=PendingState.d.ts.map