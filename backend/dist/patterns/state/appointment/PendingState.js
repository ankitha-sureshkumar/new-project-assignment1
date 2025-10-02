"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingState = void 0;
const AppointmentState_1 = require("./AppointmentState");
class PendingState extends AppointmentState_1.AppointmentState {
    name() { return 'PENDING'; }
    async approve(ctx) {
        this.appointment.status = 'APPROVED';
        this.appointment.consultationFee = ctx.consultationFee || 0;
        this.appointment.veterinarianNotes = ctx.veterinarianNotes || '';
        await this.appointment.save();
        return this.appointment;
    }
    async reschedule(ctx) {
        this.appointment.date = new Date(ctx.date);
        this.appointment.time = ctx.time;
        this.appointment.veterinarianNotes = ctx.reason ? `Rescheduled: ${ctx.reason}` : this.appointment.veterinarianNotes;
        await this.appointment.save();
        return this.appointment;
    }
}
exports.PendingState = PendingState;
//# sourceMappingURL=PendingState.js.map