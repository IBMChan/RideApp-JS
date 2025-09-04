const express = require("express");
const path = require("path");

// Load env from RideApp-JS/.env (app.js is in src/, so one level up)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./config/mongo");
const db = require("./config/mysql");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

(async () => {
  try {
    await connectDB();
    console.log("✅ Database ready");

    // Simple health route
    app.get("/", (req, res) => {
      res.send("Server is up and MongoDB connected ✅");
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();