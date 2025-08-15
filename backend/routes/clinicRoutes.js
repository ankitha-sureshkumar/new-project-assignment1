const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');

// --- Pets ---
router.get('/pets', clinicController.getPets);
router.post('/pets', clinicController.addPet);

// --- Appointments ---
router.get('/appointments', clinicController.getAppointments);
router.post('/appointments', clinicController.addAppointment);
router.delete('/appointments/:id', clinicController.deleteAppointment);

// --- Treatments ---
router.get('/treatments', clinicController.getTreatments);
router.post('/treatments', clinicController.addTreatment);

// --- Vets ---
router.get('/vets', clinicController.getVets);
router.post('/vets', clinicController.addVet);

module.exports = router;
