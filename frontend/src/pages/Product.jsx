import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axiosInstance.get('/api/products', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setProducts(response.data);
      } catch (error) {
        alert('Failed to fetch products.');
      }
    };

    fetchProducts();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <ProductForm
        products={products}
        setProducts={setProducts}
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
      />
      <ProductList products={products} setProducts={setProducts} setEditingProduct={setEditingProduct} />
    </div>
  );
};

export default Products;
