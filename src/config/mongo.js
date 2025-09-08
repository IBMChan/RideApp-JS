// config/mongo.js
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not set. Please define it in the .env file at project root.");
  process.exit(1);
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
    process.exit(1);
  }
};


// import mongoose from 'mongoose';
// import dotenv from 'dotenv';

// dotenv.config();

// const MONGO_URI = process.env.MONGO_URI;

// const connectDB = async () => {
//   if (!MONGO_URI) {
//     console.error("MONGO_URI is not set in the .env file.");
//     process.exit(1);
//   }
//   try {
//     await mongoose.connect(MONGO_URI);
//     console.log("MongoDB Connected...");
//   } catch (err) {
//     console.error("MongoDB Connection Error:", err.message);
//     process.exit(1);
//   }
// };

export default connectDB;
