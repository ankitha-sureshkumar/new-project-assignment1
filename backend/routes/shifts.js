// routes/events.js
const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');

router.post('/', shiftController.createShift);
router.get('/', shiftController.getShifts);
router.delete('/:id', shiftController.deleteShift);
router.put('/:id', shiftController.updateShift);

module.exports = router;