const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const usersRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productsRoute = require("./routes/product");
const cartsRoute = require("./routes/cart");
const ordersRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
const cors = require("cors");
dotenv.config();
const corsOptions = {
  origin: "http://localhost:3006",
  optionSuccessStatus: 200,
};

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("DB CONNEXTION SUCCESSFUL"))
  .catch((err) => {
    console.log(err);
  });
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productsRoute);
app.use("/api/carts", cartsRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/checkout", stripeRoute);

app.listen(process.env.PORT || 5000, () => {
  console.log("backend is running!");
});
