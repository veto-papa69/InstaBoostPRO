import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./production-config";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Add graceful error handling for unhandled exceptions
  process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    if (process.env.NODE_ENV === 'production') {
      console.error('🔄 Attempting to continue in production...');
    }
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    if (process.env.NODE_ENV === 'production') {
      console.error('🔄 Attempting to continue in production...');
    }
  });

  // Handle SIGTERM gracefully (Render sends this when stopping)
  process.on('SIGTERM', () => {
    console.log('📦 Received SIGTERM signal, shutting down gracefully...');
    process.exit(0);
  });

  // Handle SIGINT gracefully (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('📦 Received SIGINT signal, shutting down gracefully...');
    process.exit(0);
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Express error handler:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // Don't throw - just log and continue
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use environment port for production (Render) or fallback to 5000 for development
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  
  // For Render deployment, we need to bind to 0.0.0.0 on the specified port
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '0.0.0.0';
  
  server.listen(port, host, () => {
    console.log(`🚀 Server running on ${host}:${port}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Server listening on port ${port}`);
    
    // Force port binding for Render
    if (process.env.NODE_ENV === 'production') {
      console.log(`✅ Production server bound to port ${port}`);
    }
  });
})();
