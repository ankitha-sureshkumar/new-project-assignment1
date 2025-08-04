// models/Event.js
const mongoose = require('mongoose');
const ShiftSchema = new mongoose.Schema({
  person: String,
  start: Date,
  end: Date,
});
module.exports = mongoose.model('Shift', ShiftSchema);