import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ReviewList = ({ reviews, setReviews, setEditingReview }) => {
  const { user } = useAuth();

  const handleDelete = async (reviewId) => {
    try {
      await axiosInstance.delete(`/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setReviews(reviews.filter((review) => review._id !== reviewId));
    } catch (error) {
      alert('Failed to delete review.');
    }
  };

  return (
    <div>
      {reviews.map((review) => (
        <div key={review._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">Product ID: {review.productId}</h2>
          <p>User ID: {review.userId}</p>
          <p>Comment: {review.comment}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingReview(review)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(review._id)}
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

export default ReviewList;

