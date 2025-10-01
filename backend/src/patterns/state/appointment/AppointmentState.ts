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

export abstract class AppointmentState {
  constructor(protected appointment: IAppointment) {}
  abstract name(): string;
  async approve(ctx: TransitionContext): Promise<IAppointment> { throw new Error('Invalid transition'); }
  async confirm(): Promise<IAppointment> { throw new Error('Invalid transition'); }
  async complete(ctx: any): Promise<IAppointment> { throw new Error('Invalid transition'); }
  async cancel(reason?: string): Promise<IAppointment> { throw new Error('Invalid transition'); }
  async reject(reason?: string): Promise<IAppointment> { throw new Error('Invalid transition'); }
  async reschedule(ctx: RescheduleContext): Promise<IAppointment> { throw new Error('Invalid transition'); }
}
