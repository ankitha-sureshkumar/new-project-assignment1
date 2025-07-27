import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ProductForm = ({ products, setProducts, editingProduct, setEditingProduct }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', description: '', price: '' });

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
      });
    } else {
      setFormData({ name: '', description: '', price: '' });
    }
  }, [editingProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const response = await axiosInstance.put(`/api/products/${editingProduct._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts(products.map((product) => (product._id === response.data._id ? response.data : product)));
      } else {
        const response = await axiosInstance.post('/api/products', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts([...products, response.data]);
      }
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '' });
    } catch (error) {
      alert('Failed to save product.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingProduct ? 'Your Form Name:Edit Product' : 'Your Form Name:Add Product'}</h1>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="number"
        placeholder="Price"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingProduct ? 'Update Button' : 'Add Button'}
      </button>
    </form>
  );
};

export default ProductForm;
