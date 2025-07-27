import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const RatingForm = ({ ratings, setRatings, editingRating, setEditingRating }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ score: '', star: '' });

  useEffect(() => {
    if (editingRating) {
      setFormData({
        score: editingRating.score,
        star: editingRating.star,
      });
    } else {
      setFormData({ score: '', star: '' });
    }
  }, [editingRating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRating) {
        const response = await axiosInstance.put(`/api/ratings/${editingRating._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRatings(ratings.map((rating) => (rating._id === response.data._id ? response.data : rating)));
      } else {
        const response = await axiosInstance.post('/api/ratings', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRatings([...ratings, response.data]);
      }
      setEditingRating(null);
      setFormData({ score: '', star: '' });
    } catch (error) {
      alert('Failed to save rating.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingRating ? 'Edit Rating' : 'Create Rating'}</h1>
      <input
        type="text"
        placeholder="Score"
        value={formData.score}
        onChange={(e) => setFormData({ ...formData, score: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Star"
        value={formData.star}
        onChange={(e) => setFormData({ ...formData, star: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingRating ? 'Update Button' : 'Create Button'}
      </button>
    </form>
  );
};

export default RatingForm;
