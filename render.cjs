const express = require('express');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the dist directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username & password required.' });
  }

  // ✅ Dummy validation (replace this with real DB check)
  if (username === 'admin' && password === 'admin123') {
    return res.json({ success: true, message: 'Login successful.' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }
});

// Catch-all handler: send React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Use PORT environment variable provided by Render, fallback to 10000
const PORT = process.env.PORT || 10000;

// Bind to 0.0.0.0 for Render deployment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on 0.0.0.0:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`✅ Server successfully bound to port ${PORT}`);
});
