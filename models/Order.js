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
        itemCombo: { type: Array },
        variety: { type: Array },
      },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    taxes: { type: Number, required: true },
    totalWithTip: { type: Number, required: true },
    dropoff_contact_given_name: { type: String },
    dropoff_contact_family_name: { type: String },
    address: { type: String, required: true },
    dropoff_instructions: { type: String },
    pickup_instructions: { type: String },
    pickup_date: { type: String },
    pickup_time: { type: String },
    delivery_date: { type: String },
    delivery_time: { type: String },
    tip: { type: String },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    pickup: { type: Boolean, required: true },
    doordashSupportId: { type: String, default: "pending" },
    doordashTrackingLink: { type: String, default: "pending" },
    payment_status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
