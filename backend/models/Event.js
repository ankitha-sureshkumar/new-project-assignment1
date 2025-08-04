// models/Event.js
const mongoose = require('mongoose');
const EventSchema = new mongoose.Schema({
  person: String,
  start: Date,
  end: Date,
});
module.exports = mongoose.model('Event', EventSchema);