// Required modules
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

// NeonDB connection string (apna actual connection string yaha daal)
const sql = neon("YOUR_NEONDB_CONNECTION_URL");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.send('InstaBoost Pro Server is live 🚀');
});

// Example login POST route (adjust route and logic as per your frontend request)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // NeonDB example query — update this with your actual table/logic
    const result = await sql`SELECT * FROM users WHERE username = ${username}`;

    if (result.length > 0 && result[0].password === password) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`InstaBoost Pro server running at http://localhost:${PORT}`);
});
