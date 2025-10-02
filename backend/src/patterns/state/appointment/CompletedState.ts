import { AppointmentState } from './AppointmentState';

export class CompletedState extends AppointmentState {
  name() { return 'COMPLETED'; }
}