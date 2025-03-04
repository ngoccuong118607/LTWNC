const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');

// 📌 Route hiển thị giỏ hàng
router.get('/', async (req, res) => {
  try {
    const cart = await Cart.findOne().populate('items');
    res.render('cart', { 
      cartItems: cart ? cart.items : [], 
      cartCount: cart ? cart.items.length : 0 
    });
  } catch (error) {
    console.error('❌ Lỗi khi tải giỏ hàng:', error);
    res.status(500).send('Lỗi server');
  }
});

module.exports = router;
