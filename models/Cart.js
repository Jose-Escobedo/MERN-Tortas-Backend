const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema(
  {
    userId: { type: String },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
