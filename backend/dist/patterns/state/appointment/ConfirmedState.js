"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmedState = void 0;
const AppointmentState_1 = require("./AppointmentState");
class ConfirmedState extends AppointmentState_1.AppointmentState {
    name() { return 'CONFIRMED'; }
    async complete(ctx) {
        this.appointment.status = 'COMPLETED';
        this.appointment.diagnosis = ctx.diagnosis?.trim();
        this.appointment.treatment = ctx.treatment?.trim();
        this.appointment.followUpRequired = ctx.followUpRequired === true;
        this.appointment.veterinarianNotes = ctx.veterinarianNotes?.trim() || this.appointment.veterinarianNotes;
        this.appointment.completedAt = new Date();
        await this.appointment.save();
        return this.appointment;
    }
    async cancel(reason) {
        this.appointment.status = 'CANCELLED';
        this.appointment.veterinarianNotes = reason ? `Cancelled: ${reason}` : this.appointment.veterinarianNotes;
        await this.appointment.save();
        return this.appointment;
    }
    async reschedule(ctx) {
        this.appointment.date = new Date(ctx.date);
        this.appointment.time = ctx.time;
        this.appointment.status = 'PENDING';
        this.appointment.veterinarianNotes = ctx.reason ? `Rescheduled: ${ctx.reason}` : this.appointment.veterinarianNotes;
        await this.appointment.save();
        return this.appointment;
    }
}
exports.ConfirmedState = ConfirmedState;
//# sourceMappingURL=ConfirmedState.js.map