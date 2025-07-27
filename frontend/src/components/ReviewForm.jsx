import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ReviewForm = ({ reviews, setReviews, editingReview, setEditingReview }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ productId: '', userId: '', comment: '' });

  useEffect(() => {
    if (editingReview) {
      setFormData({
        productId: editingReview.productId,
        userId: editingReview.userId,
        comment: editingReview.comment,
      });
    } else {
      setFormData({ productId: '', userId: '', comment: '' });
    }
  }, [editingReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingReview) {
        const response = await axiosInstance.put(`/api/reviews/${editingReview._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReviews(reviews.map((review) => (review._id === response.data._id ? response.data : review)));
      } else {
        const response = await axiosInstance.post('/api/reviews', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReviews([...reviews, response.data]);
      }
      setEditingReview(null);
      setFormData({ productId: '', userId: '', comment: '' });
    } catch (error) {
      alert('Failed to save review.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingReview ? 'Edit Review' : 'Create Review'}</h1>
      <input
        type="text"
        placeholder="Product ID"
        value={formData.productId}
        onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="User ID"
        value={formData.userId}
        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Comment"
        value={formData.comment}
        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingReview ? 'Update Button' : 'Create Button'}
      </button>
    </form>
  );
};

export default ReviewForm;
