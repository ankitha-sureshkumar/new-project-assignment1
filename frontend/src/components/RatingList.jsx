import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const RatingList = ({ ratings, setRatings, setEditingRating }) => {
  const { user } = useAuth();

  const handleDelete = async (ratingId) => {
    try {
      await axiosInstance.delete(`/api/ratings/${ratingId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRatings(ratings.filter((rating) => rating._id !== ratingId));
    } catch (error) {
      alert('Failed to delete rating.');
    }
  };

  return (
    <div>
      {ratings.map((rating) => (
        <div key={rating._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">Rating Record</h2>
          <p>Score: {rating.score}</p>
          <p>Star: {rating.star}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingRating(rating)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(rating._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RatingList;

