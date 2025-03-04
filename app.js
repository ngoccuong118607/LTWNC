const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/thuchanh', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
})
  .then(() => console.log("Kết nối MongoDB thành công!"))
  .catch(err => console.error("Lỗi kết nối MongoDB:", err));

// Import Models
const Product = require('./models/product');
const Cart = require('./models/cart');

// Cấu hình middleware
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Seed dữ liệu mẫu (chạy 1 lần khi kết nối thành công)
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        { name: 'Sản phẩm 1', description: 'Mô tả sản phẩm 1', price: 100000 },
        { name: 'Sản phẩm 2', description: 'Mô tả sản phẩm 2', price: 200000 },
        { name: 'Sản phẩm 3', description: 'Mô tả sản phẩm 3', price: 300000 }
      ]);
      console.log('✅ Đã thêm sản phẩm mẫu vào database.');
    }
  } catch (err) {
    console.error("❌ Lỗi khi seed dữ liệu:", err);
  }
}
mongoose.connection.once('open', seedProducts);

// ------------------- ROUTES ------------------- //

// Import các route
const productRoutes = require('./routes/product'); // Route API cho sản phẩm
app.use(productRoutes); // Sử dụng route sản phẩm

// Trang chủ
app.get('/', async (req, res) => {
  const cart = await Cart.findOne() || { items: [] };
  res.render('index', { cartCount: cart.items.length });
});

// Danh sách sản phẩm (Trang hiển thị)
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    const cart = await Cart.findOne() || { items: [] };
    res.render('product-list', { products, cartCount: cart.items.length });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm:', error);
    res.status(500).send('Lỗi server');
  }
});

// API: Thêm sản phẩm mới
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !description || !price) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin" });
    }
    const newProduct = new Product({ name, description, price });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    res.status(500).json({ error: "Lỗi server" });
  }
});


// Chi tiết sản phẩm
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Sản phẩm không tồn tại');
    }
    const cart = await Cart.findOne() || { items: [] };
    res.render('product-detail', { product, cartCount: cart.items.length });
  } catch (error) {
    console.error('Lỗi khi tìm sản phẩm:', error);
    res.status(500).send('Lỗi server');
  }
});

// Thêm sản phẩm vào giỏ hàng
app.post('/cart/add/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    let cart = await Cart.findOne();
    if (!cart) {
      cart = new Cart({ items: [] });
    }
    cart.items.push(productId);
    await cart.save();
    res.redirect('/products');
  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    res.status(500).send('Lỗi server');
  }
});

// Xem giỏ hàng
app.get('/cart', async (req, res) => {
  try {
    const cart = await Cart.findOne().populate('items');
    const cartItems = cart ? cart.items : [];
    const cartCount = cart ? cart.items.length : 0;
    res.render('cart', { cartItems, cartCount });
  } catch (error) {
    console.error(' Lỗi khi tải giỏ hàng:', error);
    res.status(500).send('Lỗi server');
  }
});

// Khởi động server
app.listen(port, () => {
  console.log(` Server đang chạy tại http://localhost:${port}`);
});
