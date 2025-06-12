
import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { APP_CONFIG } from "./config.js";
import { routes } from "./routes.js";
import { MongoDBStorage } from "./mongodb-storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: APP_CONFIG.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize storage
const storage = new MongoDBStorage();

// Initialize database on startup
storage.initializeDatabase().then(() => {
  console.log('✅ Database initialized successfully');
}).catch(err => {
  console.error('❌ Database initialization failed:', err);
});

// API routes
app.use('/api', routes(storage));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (APP_CONFIG.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../dist');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Start server
const PORT = APP_CONFIG.PORT;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${APP_CONFIG.NODE_ENV}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

export default app;
