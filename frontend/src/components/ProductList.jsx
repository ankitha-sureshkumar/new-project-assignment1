import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ProductList = ({ products, setProducts, setEditingProduct }) => {
  const { user } = useAuth();

  const handleDelete = async (productId) => {
    try {
      await axiosInstance.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      alert('Failed to delete product.');
    }
  };

  return (
    <div>
      {products.map((product) => (
        <div key={product._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{product.name}</h2>
          <p>{product.description}</p>
          <p>{product.price}</p>
          <div className="mt-2">
            <button
              onClick={() => setEditingProduct(product)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(product._id)}
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

export default ProductList;
