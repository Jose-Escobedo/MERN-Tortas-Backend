const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log("MONGO_URL:", process.env.MONGO_URL);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ DB CONNECTION SUCCESSFUL"))
  .catch((err) => console.error("❌ DB ERROR:", err));

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Products route
app.get("/api/products", (req, res) => {
  res.json([
    { id: 1, name: "Torta de Jamón", price: 7.99 },
    { id: 2, name: "Torta Cubana", price: 9.99 },
  ]);
});

app.listen(PORT, () => {
  console.log(`✅ Backend is running on port ${PORT}`);
});
