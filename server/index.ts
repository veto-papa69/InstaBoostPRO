
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

// Start server with proper error handling
function startServer(port: number) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📱 Environment: ${APP_CONFIG.NODE_ENV}`);
    console.log(`🌐 Access at: http://localhost:${port}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`❌ Port ${port} is already in use`);
      
      // Try alternative ports
      const alternativePorts = [5001, 5002, 3001, 3002, 8000, 8080, 4000];
      const nextPort = alternativePorts.find(p => p > port);
      
      if (nextPort) {
        console.log(`🔄 Trying port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('❌ No available ports found. Please stop other running processes.');
        process.exit(1);
      }
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  return server;
}

// Start the server
startServer(APP_CONFIG.PORT);

export default app;
