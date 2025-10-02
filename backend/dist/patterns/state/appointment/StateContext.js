"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentStateContext = void 0;
const PendingState_1 = require("./PendingState");
const ApprovedState_1 = require("./ApprovedState");
const ConfirmedState_1 = require("./ConfirmedState");
const CompletedState_1 = require("./CompletedState");
const CancelledState_1 = require("./CancelledState");
const RejectedState_1 = require("./RejectedState");
class AppointmentStateContext {
    constructor(appointment) {
        this.appointment = appointment;
        this.state = this.resolveState();
    }
    resolveState() {
        const status = this.appointment.status;
        switch (status) {
            case 'PENDING': return new PendingState_1.PendingState(this.appointment);
            case 'APPROVED': return new ApprovedState_1.ApprovedState(this.appointment);
            case 'CONFIRMED': return new ConfirmedState_1.ConfirmedState(this.appointment);
            case 'COMPLETED': return new CompletedState_1.CompletedState(this.appointment);
            case 'CANCELLED': return new CancelledState_1.CancelledState(this.appointment);
            case 'REJECTED': return new RejectedState_1.RejectedState(this.appointment);
            default: return new PendingState_1.PendingState(this.appointment);
        }
    }
    getState() { return this.state; }
}
exports.AppointmentStateContext = AppointmentStateContext;
//# sourceMappingURL=StateContext.js.map