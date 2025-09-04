import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

const MONGO_URI = process.env.MONGO_URI;
const PORT = Number(process.env.PORT) || 3000;

if (!MONGO_URI) {
  console.error("MONGO_URI is not set. Please define it in the .env file at project root.");
  process.exit(1);
}

// MongoDB connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error(" MongoDB Error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("MongoDB connection successful!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
