
const express = require('express');
const { getReviews, addReview,updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/reviewMiddleware');
const router = express.Router();

router.get('/', protect, getReviews);
router.post('/', addReview);
router.put('/', protect,updateReview);
router.delete('/', deleteReview);

module.exports = router;
