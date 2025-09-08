// src/app.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// DB connections
import connectMongoDB from "./config/mongodb.js";
import connectMySQL from "./config/mysql.js";

// Routes
import driverRoutes from "./routes/driver-routes.js";
// (later you can add riderRoutes, authRoutes, etc.)

dotenv.config();

const app = express();

// ---------- Middleware ----------
app.use(express.json());
app.use(cookieParser());

// ---------- Routes ----------
app.use("/api/rides/driver", driverRoutes);

// Health check / root endpoint
app.get("/", (req, res) => {
  res.send("🚗 RideApp API is running...");
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // connect to databases in parallel
    await Promise.all([connectMongoDB(), connectMySQL()]);
    console.log("✅ Databases connected (MongoDB + MySQL)");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

export default app;
