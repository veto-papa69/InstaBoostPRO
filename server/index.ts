
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

// Start server with error handling
const PORT = APP_CONFIG.PORT;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${APP_CONFIG.NODE_ENV}`);
  console.log(`🌐 Access at: http://localhost:${PORT}`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use`);
    console.log('🔄 Trying to find an available port...');
    
    // Try alternative ports
    const alternativePorts = [5001, 5002, 3000, 8000, 8080];
    let portFound = false;
    
    for (const altPort of alternativePorts) {
      try {
        const altServer = app.listen(altPort, '0.0.0.0', () => {
          console.log(`🚀 Server running on alternative port ${altPort}`);
          console.log(`📱 Environment: ${APP_CONFIG.NODE_ENV}`);
          console.log(`🌐 Access at: http://localhost:${altPort}`);
          portFound = true;
        });
        
        altServer.on('error', () => {
          // Try next port
        });
        
        if (portFound) break;
      } catch (error) {
        // Continue to next port
      }
    }
    
    if (!portFound) {
      console.error('❌ No available ports found. Please stop other running processes.');
      process.exit(1);
    }
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

export default app;
