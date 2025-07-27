const Review = require('../models/Review');

const getReviews = async (req, res) => {
    try {
      const reviews = await Review.find({});
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const addReview = async (req, res) => {
    const { productId, userId, comment,} = req.body;
    try {
      const review = await Review.create({productId,userId,comment});
      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateReview = async (req, res) => {
    const { productId, userId } = req.body;
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: 'Review not found' });
  
      review.productId = productId || review.productId;
      review.userId = userId || review.userId;
  
      const updatedReview = await review.save();
      res.json(updatedReview);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const deleteReview = async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) return res.status(404).json({ message: 'Review not found' });
  
      await review.remove();
      res.json({ message: 'Review deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  module.exports = {getReviews,addReview,updateReview,deleteReview};