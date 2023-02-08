const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    customerId: { type: String },
    paymentIntentId: { type: String },
    products: [
      {
        name: { type: String, required: true },
        extras: { type: Array },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        note: { type: Array },
      },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    taxes: { type: Number, required: true },
    totalWithTip: { type: Number, required: true },
    address: { type: String, required: true },
    dropoff_instructions: { type: String },
    pickup_instructions: { type: String },
    tip: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    pickup: { type: Boolean, required: true },
    payment_status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
