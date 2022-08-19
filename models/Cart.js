const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    products: [
      {
        productId: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        extras: { type: Array },
      },
    ],
    amount: { type: Number },
    address: { type: Object },
    phone: { type: String },
    email: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
