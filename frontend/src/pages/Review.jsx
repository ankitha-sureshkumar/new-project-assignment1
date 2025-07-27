import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { useAuth } from '../context/AuthContext';

const Review = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axiosInstance.get('/api/reviews', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setReviews(response.data);
      } catch (error) {
        alert('Failed to fetch reviews.');
      }
    };

    fetchReviews();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <ReviewForm
        reviews={reviews}
        setReviews={setReviews}
        editingReview={editingReview}
        setEditingReview={setEditingReview}
      />
      <ReviewList reviews={reviews} setReviews={setReviews} setEditingReview={setEditingReview} />
    </div>
  );
};

export default Review;
