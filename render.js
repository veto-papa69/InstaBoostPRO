

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI,
    ttl: 24 * 60 * 60, // 1 day
    touchAfter: 24 * 3600
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
  name: 'smm.sid',
  rolling: true,
}));

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// User schema for MongoDB
const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  instagramUsername: { type: String, required: true },
  password: { type: String, required: true },
  walletBalance: { type: String, default: '0.00' },
  bonusClaimed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Order schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  serviceName: { type: String, required: true },
  instagramUsername: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: String, required: true },
  status: { type: String, default: 'Processing' },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Payment schema
const paymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: String, required: true },
  utrNumber: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Helper functions
function generateUID() {
  return "UID" + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function generateOrderId() {
  return "ORDER" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { instagramUsername, password } = req.body;
    
    if (!instagramUsername || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check if user exists
    let user = await User.findOne({ instagramUsername });
    
    if (!user) {
      // Create new user
      const uid = generateUID();
      user = new User({
        uid,
        instagramUsername,
        password,
        walletBalance: '0.00',
        bonusClaimed: false
      });
      await user.save();
      console.log('New user created:', user.uid);
    }

    // Store user in session
    req.session.userId = user._id.toString();
    req.session.uid = user.uid;

    res.json({ 
      success: true, 
      user: { 
        id: user._id,
        uid: user.uid,
        instagramUsername: user.instagramUsername,
        walletBalance: user.walletBalance,
        bonusClaimed: user.bonusClaimed
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/api/auth/user', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      uid: user.uid,
      instagramUsername: user.instagramUsername,
      walletBalance: user.walletBalance,
      bonusClaimed: user.bonusClaimed
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Services endpoint
app.get('/api/services', (req, res) => {
  const services = [
    { id: 1, name: 'Instagram Followers (Indian)', category: 'followers', rate: 6, minOrder: 100, maxOrder: 100000 },
    { id: 2, name: 'Instagram Followers (USA)', category: 'followers', rate: 7, minOrder: 100, maxOrder: 50000 },
    { id: 3, name: 'Instagram Followers (HQ Non Drop)', category: 'followers', rate: 11, minOrder: 100, maxOrder: 10000 },
    { id: 4, name: 'Instagram Likes (Bot)', category: 'likes', rate: 2, minOrder: 100, maxOrder: 50000 },
    { id: 5, name: 'Instagram Likes (Non Drop)', category: 'likes', rate: 4, minOrder: 100, maxOrder: 25000 },
    { id: 6, name: 'Instagram Likes (Girl Accounts)', category: 'likes', rate: 6, minOrder: 100, maxOrder: 10000 }
  ];
  res.json(services);
});

// Orders endpoints
app.post('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { serviceName, instagramUsername, quantity, price } = req.body;
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userBalance = parseFloat(user.walletBalance);
    if (userBalance < price) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Create order
    const orderId = generateOrderId();
    const order = new Order({
      orderId,
      userId: user.uid,
      serviceName,
      instagramUsername,
      quantity,
      price: price.toString(),
      status: 'Processing'
    });
    await order.save();

    // Deduct from wallet
    user.walletBalance = (userBalance - price).toFixed(2);
    await user.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(400).json({ error: 'Invalid order data' });
  }
});

app.get('/api/orders', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const orders = await Order.find({ userId: user.uid }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Payments endpoints
app.post('/api/payments', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { amount, utrNumber, paymentMethod } = req.body;
    
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const payment = new Payment({
      userId: user.uid,
      amount: amount.toString(),
      utrNumber,
      paymentMethod,
      status: 'Pending'
    });
    await payment.save();

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(400).json({ error: 'Invalid payment data' });
  }
});

app.get('/api/payments', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const payments = await Payment.find({ userId: user.uid }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bonus claim endpoint
app.post('/api/bonus/claim', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.bonusClaimed) {
      return res.status(400).json({ error: 'Bonus already claimed' });
    }

    // Add bonus to wallet and mark as claimed
    const newBalance = (parseFloat(user.walletBalance) + 10).toFixed(2);
    user.walletBalance = newBalance;
    user.bonusClaimed = true;
    await user.save();

    res.json({ 
      success: true, 
      newBalance,
      message: '₹10 bonus claimed successfully!' 
    });
  } catch (error) {
    console.error('Claim bonus error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
  });
});

