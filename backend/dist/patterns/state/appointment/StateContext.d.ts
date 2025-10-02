import { IAppointment } from '../../../models/Appointment';
import { AppointmentState } from './AppointmentState';
export declare class AppointmentStateContext {
    private appointment;
    private state;
    constructor(appointment: IAppointment);
    private resolveState;
    getState(): AppointmentState;
}
//# sourceMappingURL=StateContext.d.ts.map