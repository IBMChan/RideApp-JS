
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const app = express();

const MONGO_URI = process.env.MONGO_URI;
const PORT = Number(process.env.PORT) || 3000;

if (!MONGO_URI) {
  console.error(" MONGO_URI is not set. Please define it in the .env file at project root.");
  process.exit(1);
}

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log(" MongoDB Connected"))
  .catch((err) => {
    console.error("MongoDB Error:", err);
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("MongoDB connection successful!");
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});