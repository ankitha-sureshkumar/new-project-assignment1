const mongoose = require('mongoose');

const vetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String },
  phone: { type: String }
});

module.exports = mongoose.model('Vet', vetSchema);
