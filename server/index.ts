import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { updateServicePrices } from "./update-service-prices";
import "./production-config";

const app = express();
const PORT = process.env.PORT || 3000;

// Core Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalJson = res.json;
  res.json = function (body: any) {
    capturedJsonResponse = body;
    return originalJson.call(this, body);
  };

  res.on("finish", () => {
    if (!path.startsWith("/api")) return;

    const duration = Date.now() - start;
    let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

    if (capturedJsonResponse) {
      logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
    }

    if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
    log(logLine);
  });

  next();
});

// Setup async app lifecycle
async function bootstrap() {
  try {
    // Hook into service price updater if needed
    await updateServicePrices(); // ensure it's an async function

    // Static file serving (e.g. from dist/)
    serveStatic(app);

    // API + Page Routes
    registerRoutes(app);

    // Vite (for dev mode)
    await setupVite(app);

    // Start Server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log("📦 Received shutdown signal. Closing server...");
      server.close(() => {
        console.log("🛑 Server closed. Exiting process.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown); // CTRL+C

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Global Error Handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  if (process.env.NODE_ENV === "production") {
    console.error("🔄 Continuing despite uncaught exception...");
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  if (process.env.NODE_ENV === "production") {
    console.error("🔄 Continuing despite unhandled rejection...");
  }
});

// Start everything
bootstrap();
