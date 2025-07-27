const Rating = require('../models/Rating');

const getRatings = async (req, res) => {
    try {
      const ratings = await Rating.find({});
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const addRating = async (req, res) => {
    const { score, star } = req.body;
    try {
      const rating = await Rating.create({ score, star });
      res.status(201).json(rating);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateRating = async (req, res) => {
    const { score, star } = req.body;
    try {
      const rating = await Rating.findById(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating not found' });
  
      rating.score = score || rating.score;
      rating.star = star || rating.star;
  
      const updatedRating = await rating.save();
      res.json(updatedRating);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const deleteRating = async (req, res) => {
    try {
      const rating = await Rating.findById(req.params.id);
      if (!rating) return res.status(404).json({ message: 'Rating not found' });
  
      await rating.remove();
      res.json({ message: 'Rating deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  module.exports = { getRatings, addRating, updateRating, deleteRating };