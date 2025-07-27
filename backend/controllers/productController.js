const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProduct = async (req, res) => {
    const { name, description, price } = req.body;
    try {
      const product = await Product.create({name,description,price});
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateProduct = async (req, res) => {
    const { name, description, price } = req.body;
    try {
      const product = await Product.findById(req.params.id);
      if (!product)
        return res.status(404).json({ message: 'Product not found' });
  
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
  
      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const deleteProduct = async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      await product.remove();
      res.json({ message: 'Product deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  module.exports = {getProducts,addProduct,updateProduct,deleteProduct};

  