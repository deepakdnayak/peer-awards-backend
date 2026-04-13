import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import titleRoutes from "./modules/title/title.routes";
import nominationRoutes from "./modules/nomination/nomination.routes";
import finalRoutes from "./modules/final/final.routes";
import { SystemConfig } from "./models/systemConfig.model";

const app = express();

app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/", async (req, res) => {
  try {
    // Check database connection by querying SystemConfig
    const systemConfig = await SystemConfig.findOne();

    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      server: {
        nodeVersion: process.version,
        platform: process.platform,
        architecture: process.arch,
        memoryUsage: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
        },
      }
    };

    res.status(200).json(healthData);
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Database connection failed",
      uptime: process.uptime(),
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/titles", titleRoutes);
app.use("/api/nominations", nominationRoutes);
app.use("/api/final", finalRoutes);

export default app;