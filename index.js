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
const adminRoute = require("./routes/admin");
const doordashRoute = require("./routes/doordashGet");
const cors = require("cors");

dotenv.config();
const corsOptions = {
  origin: ["https://tortasfrontend.herokuapp.com/"],
  optionSuccessStatus: 200,
};

mongoose
  .connect(process.env.MONGO_URL)
  .then(console.log("DB CONNECTION SUCCESSFUL"))
  .catch((err) => {
    console.log(err);
  });
app.use(cors(corsOptions));
app.use(
  express.json({
    limit: "5mb",
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productsRoute);
app.use("/api/carts", cartsRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/checkout", stripeRoute);
app.use("/api/admin", adminRoute);
app.set("/api/doordash", doordashRoute);
// app.use("/api/doordash", doordashRouteGet);

app.listen(process.env.PORT || 5000, () => {
  console.log("backend is running!");
});
