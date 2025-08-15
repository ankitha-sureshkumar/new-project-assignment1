const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const Vet = require('../models/Vet');

// -------------------- Pets --------------------
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addPet = async (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ message: "Pet name and type are required" });
  }
  try {
    const newPet = new Pet({ name, type });
    await newPet.save();
    res.status(201).json(newPet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------- Appointments --------------------
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('petId');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addAppointment = async (req, res) => {
  const { petId, petName, petAge, date, hospital } = req.body;
  if (!petId || !petName || !petAge || !date || !hospital) {
    return res.status(400).json({ message: "All appointment fields are required" });
  }
  try {
    const newAppt = new Appointment({ petId, petName, petAge, date, hospital });
    await newAppt.save();
    res.status(201).json(newAppt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
// -------------------- Delete Appointment --------------------
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    await appointment.remove();
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- Treatments --------------------
const getTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find().populate('petId');
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addTreatment = async (req, res) => {
  const { petId, description } = req.body;
  if (!petId || !description) {
    return res.status(400).json({ message: "Pet and description are required" });
  }
  try {
    const newTreat = new Treatment({ petId, description });
    await newTreat.save();
    res.status(201).json(newTreat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------- Vets --------------------
const getVets = async (req, res) => {
  try {
    const vets = await Vet.find();
    res.json(vets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addVet = async (req, res) => {
  const { name, specialization } = req.body;
  if (!name || !specialization) {
    return res.status(400).json({ message: "Vet name and specialization are required" });
  }
  try {
    const newVet = new Vet({ name, specialization });
    await newVet.save();
    res.status(201).json(newVet);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// -------------------- Export all functions --------------------
module.exports = {
  getPets,
  addPet,
  getAppointments,
  addAppointment,
  deleteAppointment,
  getTreatments,
  addTreatment,
  getVets,
  addVet,
};
