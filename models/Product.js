const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    img: { type: String, required: true },
    categories: { type: Array },
    itemCombo: { type: Array },
    extras: { type: Array },
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
    quantity: { type: Number },
    note: { type: Array },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
