import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { connectDB } from "./config/mongo.js";

import { connectMySQL, pool } from "./config/mysql.js";
import userRoutes from "./routes/user-routes.js";
import driverRoutes from "./routes/driver-routes.js";
import riderRoutes from "./routes/rider-routes.js";
import cookieParser from "cookie-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Middlewares
app.use(express.json());

// Middlewares
app.use(express.json()); // handles JSON
app.use(express.urlencoded({ extended: true })); // handles form data
app.use(cookieParser());

app.use(cookieParser());

// harshit -- users
app.use("/app/users", userRoutes);

// raksha / laxmikanth-- drivers
app.use("/app/driver", driverRoutes);

// chandana -- riders
app.use("/app/riders", riderRoutes);

(async () => {
  try {
    await Promise.all([connectDB(), connectMySQL()]);
    console.log("Databases ready (MongoDB + MySQL)");

    try {
      const { verifyEmailTransport } = await import("./services/notification-service.js");
      await verifyEmailTransport();
    } catch (mailErr) {
      console.error("Email verification failed:", mailErr?.message || mailErr);
    }

    app.get("/", async (req, res) => {
      try {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        res.send("Server is up. MongoDB and MySQL connected ");
      } catch (e) {
        res.status(500).send("Server up, but MySQL ping failed.");
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
