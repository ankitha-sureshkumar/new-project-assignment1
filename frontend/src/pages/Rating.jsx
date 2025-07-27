import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import RatingForm from '../components/RatingForm';
import RatingList from '../components/RatingList';
import { useAuth } from '../context/AuthContext';

const Rating = () => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [editingRating, setEditingRating] = useState(null);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await axiosInstance.get('/api/ratings', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setRatings(response.data);
      } catch (error) {
        alert('Failed to fetch ratings.');
      }
    };

    fetchRatings();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <RatingForm
        ratings={ratings}
        setRatings={setRatings}
        editingRating={editingRating}
        setEditingRating={setEditingRating}
      />
      <RatingList ratings={ratings} setRatings={setRatings} setEditingRating={setEditingRating} />
    </div>
  );
};

export default Rating;
