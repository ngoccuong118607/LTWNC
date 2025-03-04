const express = require('express');
const router = express.Router();
const Product = require('../models/product'); // Import model sản phẩm

// Lấy danh sách sản phẩm (API GET /api/products)
router.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find(); // Lấy tất cả sản phẩm từ MongoDB
    res.json(products); // Trả về danh sách sản phẩm dưới dạng JSON
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách sản phẩm', error });
  }
});

// Thêm sản phẩm mới (API POST /api/products)
router.post('/api/products', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const newProduct = new Product({ name, description, price });
    await newProduct.save();
    res.status(201).json(newProduct); // Trả về sản phẩm vừa tạo
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm sản phẩm', error });
  }
});

module.exports = router;
