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

// Load env variables
dotenv.config();
console.log("MONGO_URL:", process.env.MONGO_URL);

// MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB CONNECTION SUCCESSFUL"))
  .catch((err) => console.log("DB ERROR:", err));

// Setup server and socket.io
// const server = app.listen(process.env.PORT || 5000, () => {
//   console.log("backend is running!");
// });

// const io = new Server(server, {
//   cors: {
//     origin: "https://mern-tortas-frontend.vercel.app",
//   },
// });
// app.set("socketio", io);

// Force HTTPS only in production
if (process.env.NODE_ENV === "production") {
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// CORS + JSON config
const corsOptions = {
  origin: ["https://mern-tortas-frontend.vercel.app"],
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
