const mongoose = require("mongoose");

const treatmentSchema = new mongoose.Schema({
  petId: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  description: { type: String, required: true },
});

module.exports = mongoose.model("Treatment", treatmentSchema);
