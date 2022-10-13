const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
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
    total: { type: Number, required: true },
    taxes: { type: Number, required: true },
    totalWithTip: { type: Number, required: true },
    address: { type: String, required: true },
    tip: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
