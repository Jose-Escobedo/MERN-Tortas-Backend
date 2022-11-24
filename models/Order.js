const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    customerId: { type: String },
    paymentIntentId: { type: String },
    products: [
      {
        id: { type: String },
        name: { type: String, required: true },
        quantity: { type: Number },
      },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    taxes: { type: Number, required: true },
    totalWithTip: { type: Number, required: true },
    address: { type: String, required: true },
    tip: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    pickup: { type: Boolean, required: true },
    payment_status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
