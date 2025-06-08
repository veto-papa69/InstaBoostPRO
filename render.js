
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

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
