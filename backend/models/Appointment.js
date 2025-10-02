
const mongoose = require("mongoose");

const AppointmentSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  petAge: { type: Number, required: true },
  date: { type: Date, required: true },
  hospital: { type: String, required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
