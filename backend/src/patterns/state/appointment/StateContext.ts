import { IAppointment } from '../../../models/Appointment';
import { AppointmentState } from './AppointmentState';
import { PendingState } from './PendingState';
import { ApprovedState } from './ApprovedState';
import { ConfirmedState } from './ConfirmedState';
import { CompletedState } from './CompletedState';
import { CancelledState } from './CancelledState';
import { RejectedState } from './RejectedState';

export class AppointmentStateContext {
  private state: AppointmentState;
  constructor(private appointment: IAppointment) {
    this.state = this.resolveState();
  }
  private resolveState(): AppointmentState {
    const status = this.appointment.status;
    switch (status) {
      case 'PENDING': return new PendingState(this.appointment);
      case 'APPROVED': return new ApprovedState(this.appointment);
      case 'CONFIRMED': return new ConfirmedState(this.appointment);
      case 'COMPLETED': return new CompletedState(this.appointment);
      case 'CANCELLED': return new CancelledState(this.appointment);
      case 'REJECTED': return new RejectedState(this.appointment);
      default: return new PendingState(this.appointment);
    }
  }
  getState(): AppointmentState { return this.state; }
}