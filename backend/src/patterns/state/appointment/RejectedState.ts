import { AppointmentState } from './AppointmentState';

export class RejectedState extends AppointmentState {
  name() { return 'REJECTED'; }
}