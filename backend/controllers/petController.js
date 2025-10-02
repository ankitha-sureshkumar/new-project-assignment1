const Pet = require('../models/Pet');
const Appointment = require('../models/Appointment');
const Treatment = require('../models/Treatment');
const Vet = require('../models/Vet');

// -------------------- PETS -------------------- //
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addPet = async (req, res) => {
  const { name, species, age, ownerName } = req.body;
  try {
    const pet = await Pet.create({ name, species, age, ownerName });
    res.status(201).json(pet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    pet.name = req.body.name || pet.name;
    pet.species = req.body.species || pet.species;
    pet.age = req.body.age || pet.age;
    pet.ownerName = req.body.ownerName || pet.ownerName;

    const updatedPet = await pet.save();
    res.json(updatedPet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) return res.status(404).json({ message: 'Pet not found' });

    await pet.remove();
    res.json({ message: 'Pet deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- APPOINTMENTS -------------------- //
const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('pet vet');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addAppointment = async (req, res) => {
  const { petId, vetId, date, reason } = req.body;
  try {
    const appointment = await Appointment.create({ pet: petId, vet: vetId, date, reason });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- TREATMENTS -------------------- //
const getTreatments = async (req, res) => {
  try {
    const treatments = await Treatment.find().populate('pet');
    res.json(treatments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addTreatment = async (req, res) => {
  const { petId, description, cost } = req.body;
  try {
    const treatment = await Treatment.create({ pet: petId, description, cost });
    res.status(201).json(treatment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- VETS -------------------- //
const getVets = async (req, res) => {
  try {
    const vets = await Vet.find();
    res.json(vets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addVet = async (req, res) => {
  const { name, specialization, phone } = req.body;
  try {
    const vet = await Vet.create({ name, specialization, phone });
    res.status(201).json(vet);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  // Pets
  getPets,
  addPet,
  updatePet,
  deletePet,
  // Appointments
  getAppointments,
  addAppointment,
  // Treatments
  getTreatments,
  addTreatment,
  // Vets
  getVets,
  addVet
};
