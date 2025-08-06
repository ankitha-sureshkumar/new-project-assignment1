// routes/leaveRoutes.js
const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, leaveController.createLeaveRequest);
router.get('/', leaveController.getLeaveRequests);
router.delete('/:id', protect, leaveController.deleteLeaveRequest);
router.put('/:id', protect, leaveController.updateLeaveRequest);

module.exports = router;