"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentState = void 0;
class AppointmentState {
    constructor(appointment) {
        this.appointment = appointment;
    }
    async approve(ctx) { throw new Error('Invalid transition'); }
    async confirm() { throw new Error('Invalid transition'); }
    async complete(ctx) { throw new Error('Invalid transition'); }
    async cancel(reason) { throw new Error('Invalid transition'); }
    async reject(reason) { throw new Error('Invalid transition'); }
    async reschedule(ctx) { throw new Error('Invalid transition'); }
}
exports.AppointmentState = AppointmentState;
//# sourceMappingURL=AppointmentState.js.map