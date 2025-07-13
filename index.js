const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const productsRoute = require("./routes/product");

dotenv.config();
const app = express();

// Debug: log DB connection string
console.log("MONGO_URL:", process.env.MONGO_URL);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB CONNECTION SUCCESSFUL"))
  .catch((err) => console.error("DB ERROR:", err));

// Middlewares
app.use(cors({ origin: ["https://mern-tortas-frontend.vercel.app"] }));
app.use(express.json());

// Routes
app.get("/ping", (req, res) => res.send("pong"));
app.use("/api/products", productsRoute);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("backend is running on port", PORT);
});
