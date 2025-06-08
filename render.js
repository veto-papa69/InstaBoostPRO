import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://instaboost_user:uX1YzKjiOETNhyYj@cluster0.tolxjiz.mongodb.net/instaboost?retryWrites=true&w=majority&appName=Cluster0';
    await mongoose.connect(mongoUri);
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
    const { username, password } = req.body;
    
    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // For demo purposes - replace with real authentication
    if (username === 'demo' && password === 'demo123') {
      res.json({ 
        success: true, 
        user: { id: 1, username: 'demo', balance: 0 },
        message: 'Login successful'
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // For demo purposes - replace with real user creation
    res.json({ 
      success: true, 
      user: { id: Date.now(), username, email, balance: 0 },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Basic API routes
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
