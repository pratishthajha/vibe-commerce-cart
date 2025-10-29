const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb://localhost:27017/vibe-commerce';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// ==================== MODELS ====================

// Product Schema
const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  description: { type: String },
  category: { type: String }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Cart Item Schema
const cartItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true,
    min: [1, 'Quantity cannot be less than 1']
  },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  total: { type: Number, required: true }
}, { timestamps: true });

// Cart Schema
const cartSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    default: 'mock-user-001' 
  },
  items: [cartItemSchema],
  subTotal: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  cartItems: [cartItemSchema],
  total: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  orderId: { type: String, unique: true }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// ==================== ROUTES ====================

// GET /api/products - Get all products
app.get('/api/products', async (req, res) => {
  try {
    let products = await Product.find();
    
    // If no products exist, seed database with mock products
    if (products.length === 0) {
      const mockProducts = [
        {
          id: 1,
          name: "Wireless Headphones",
          price: 2999,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
          description: "Premium wireless headphones with noise cancellation",
          category: "Electronics"
        },
        {
          id: 2,
          name: "Smart Watch",
          price: 4999,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
          description: "Fitness tracker with heart rate monitor",
          category: "Electronics"
        },
        {
          id: 3,
          name: "Coffee Maker",
          price: 1999,
          image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
          description: "Automatic drip coffee maker",
          category: "Home"
        },
        {
          id: 4,
          name: "Running Shoes",
          price: 3499,
          image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
          description: "Lightweight running shoes for comfort",
          category: "Fashion"
        },
        {
          id: 5,
          name: "Backpack",
          price: 1499,
          image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
          description: "Durable travel backpack with laptop compartment",
          category: "Fashion"
        },
        {
          id: 6,
          name: "Desk Lamp",
          price: 899,
          image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
          description: "LED desk lamp with adjustable brightness",
          category: "Home"
        },
        {
          id: 7,
          name: "Water Bottle",
          price: 499,
          image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
          description: "Insulated stainless steel water bottle",
          category: "Sports"
        },
        {
          id: 8,
          name: "Bluetooth Speaker",
          price: 2499,
          image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500",
          description: "Portable Bluetooth speaker with bass boost",
          category: "Electronics"
        },
        {
          id: 9,
          name: "Yoga Mat",
          price: 799,
          image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
          description: "Non-slip yoga mat for all exercises",
          category: "Sports"
        },
        {
          id: 10,
          name: "Sunglasses",
          price: 1299,
          image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
          description: "UV protection sunglasses",
          category: "Fashion"
        }
      ];
      
      products = await Product.insertMany(mockProducts);
      console.log('✅ Database seeded with mock products');
    }
    
    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// POST /api/cart - Add item to cart
app.post('/api/cart', async (req, res) => {
  try {
    const { productId, qty } = req.body;
    
    if (!productId || !qty) {
      return res.status(400).json({
        success: false,
        error: 'Product ID and quantity are required'
      });
    }
    
    const quantity = Number(qty);
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      });
    }
    
    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    // Find or create cart for mock user
    let cart = await Cart.findOne({ userId: 'mock-user-001' });
    
    if (cart) {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );
      
      if (itemIndex > -1) {
        // Update quantity
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].total = cart.items[itemIndex].quantity * product.price;
      } else {
        // Add new item
        cart.items.push({
          productId: product._id,
          quantity: quantity,
          price: product.price,
          name: product.name,
          total: product.price * quantity
        });
      }
      
      // Calculate subtotal
      cart.subTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
      await cart.save();
    } else {
      // Create new cart
      cart = await Cart.create({
        userId: 'mock-user-001',
        items: [{
          productId: product._id,
          quantity: quantity,
          price: product.price,
          name: product.name,
          total: product.price * quantity
        }],
        subTotal: product.price * quantity
      });
    }
    
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    
    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: populatedCart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
      message: error.message
    });
  }
});

// GET /api/cart - Get cart with total
app.get('/api/cart', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: 'mock-user-001' }).populate('items.productId');
    
    if (!cart) {
      cart = await Cart.create({
        userId: 'mock-user-001',
        items: [],
        subTotal: 0
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart',
      message: error.message
    });
  }
});

// DELETE /api/cart/:id - Remove item from cart
app.delete('/api/cart/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    
    const cart = await Cart.findOne({ userId: 'mock-user-001' });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    // Remove item from cart
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    // Recalculate subtotal
    cart.subTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: populatedCart
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart',
      message: error.message
    });
  }
});

// PUT /api/cart/:id - Update cart item quantity
app.put('/api/cart/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }
    
    const cart = await Cart.findOne({ userId: 'mock-user-001' });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = cart.items[itemIndex].price * quantity;
    
    cart.subTotal = cart.items.reduce((acc, item) => acc + item.total, 0);
    
    await cart.save();
    
    const populatedCart = await Cart.findById(cart._id).populate('items.productId');
    
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: populatedCart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart',
      message: error.message
    });
  }
});

// POST /api/checkout - Mock checkout
app.post('/api/checkout', async (req, res) => {
  try {
    const { cartItems, customerName, customerEmail } = req.body;
    
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }
    
    if (!customerName || !customerEmail) {
      return res.status(400).json({
        success: false,
        error: 'Customer name and email are required'
      });
    }
    
    // Calculate total
    const total = cartItems.reduce((acc, item) => acc + item.total, 0);
    
    // Generate order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Create order
    const order = await Order.create({
      customerName,
      customerEmail,
      cartItems,
      total,
      orderId,
      orderDate: new Date()
    });
    
    // Clear cart after checkout
    await Cart.findOneAndUpdate(
      { userId: 'mock-user-001' },
      { items: [], subTotal: 0 }
    );
    
    // Mock receipt
    const receipt = {
      orderId: order.orderId,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.cartItems,
      total: order.total,
      timestamp: order.orderDate,
      message: 'Thank you for your order!'
    };
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: receipt
    });
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Checkout failed',
      message: error.message
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date()
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
