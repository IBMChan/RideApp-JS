import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { connectDB } from "./config/mongo.js";
import { connectMySQL, pool } from "./config/mysql.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON bodies
app.use(express.json());

// Mount routes
import rideRoutes from "./routes/ride-routes.js";
app.use("/api", rideRoutes);

(async () => {
  try {
    // Connect to MongoDB and MySQL before starting server
    await Promise.all([connectDB(), connectMySQL()]);
    console.log("✅ Databases ready (MongoDB + MySQL)");

    // Verify email transport (helps catch SMTP issues early)
    try {
      const { verifyEmailTransport } = await import("./services/notification-service.js");
      await verifyEmailTransport();
    } catch (mailErr) {
      console.error("Email verification failed:", mailErr?.message || mailErr);
    }

    // Simple health route
    app.get("/", async (req, res) => {
      try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        res.send("Server is up. MongoDB and MySQL connected ✅");
      } catch (e) {
        res.status(500).send("Server up, but MySQL ping failed.");
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();