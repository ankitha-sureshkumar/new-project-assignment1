
const express = require('express');
const { getRatings, addRating,updateRating, deleteRating } = require('../controllers/ratingController');
const { protect } = require('../middleware/RatingMiddleware');
const router = express.Router();

router.get('/', protect, getRatings);
router.post('/', addRating);
router.put('/', protect,updateRating);
router.delete('/', deleteRating);

module.exports = router;
