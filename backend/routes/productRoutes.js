
const express = require('express');
const { getProducts, addProduct,updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/productMiddleware');
const router = express.Router();

router.get('/', protect, getProducts);
router.post('/', addProduct);
router.put('/', protect,updateProduct);
router.delete('/', deleteProduct);

module.exports = router;
