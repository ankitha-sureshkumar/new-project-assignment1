import { AppointmentState, TransitionContext, RescheduleContext } from './AppointmentState';

export class PendingState extends AppointmentState {
  name() { return 'PENDING'; }
  async approve(ctx: TransitionContext) {
    this.appointment.status = 'APPROVED';
    this.appointment.consultationFee = ctx.consultationFee || 0;
    this.appointment.veterinarianNotes = ctx.veterinarianNotes || '';
    await this.appointment.save();
    return this.appointment;
  }
  async reschedule(ctx: RescheduleContext) {
    this.appointment.date = new Date(ctx.date);
    this.appointment.time = ctx.time;
    this.appointment.veterinarianNotes = ctx.reason ? `Rescheduled: ${ctx.reason}` : this.appointment.veterinarianNotes;
    // remain PENDING
    await this.appointment.save();
    return this.appointment;
  }
}
