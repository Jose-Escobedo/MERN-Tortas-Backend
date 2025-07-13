const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const usersRoute = require("./routes/user");
const productsRoute = require("./routes/product");
const cartsRoute = require("./routes/cart");
const cors = require("cors");
const { Server } = require("socket.io");
const enforce = require("express-sslify");

dotenv.config();
console.log("MONGO_URL:", process.env.MONGO_URL);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB CONNECTION SUCCESSFUL"))
  .catch((err) => console.log("DB ERROR:", err));

// Force HTTPS only in production
if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// CORS + JSON config
const corsOptions = {
  origin: ["https://www.tortasmexico-studiocity.com"],
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(
  express.json({
    limit: "5mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// Routes
app.use("/api/users", usersRoute);
app.use("/api/products", productsRoute);
app.use("/api/carts", cartsRoute);

// Start server and then setup socket.io
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend is running on port ${PORT}`);
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "https://www.tortasmexico-studiocity.com",
  },
});
app.set("socketio", io);
