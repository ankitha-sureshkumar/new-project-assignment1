
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', registerUser);
router.post('/', loginUser);
router.get('/', protect, getProfile);
router.put('/', protect, updateUserProfile);

module.exports = router;
