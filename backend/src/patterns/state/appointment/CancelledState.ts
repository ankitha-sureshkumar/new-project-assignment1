import { AppointmentState } from './AppointmentState';

export class CancelledState extends AppointmentState {
  name() { return 'CANCELLED'; }
}