import { IAppointment } from '../../../models/Appointment';
export type TransitionContext = {
    consultationFee?: number;
    veterinarianNotes?: string;
};
export type RescheduleContext = {
    date: Date | string;
    time: string;
    reason?: string;
};
export declare abstract class AppointmentState {
    protected appointment: IAppointment;
    constructor(appointment: IAppointment);
    abstract name(): string;
    approve(ctx: TransitionContext): Promise<IAppointment>;
    confirm(): Promise<IAppointment>;
    complete(ctx: any): Promise<IAppointment>;
    cancel(reason?: string): Promise<IAppointment>;
    reject(reason?: string): Promise<IAppointment>;
    reschedule(ctx: RescheduleContext): Promise<IAppointment>;
}
//# sourceMappingURL=AppointmentState.d.ts.map