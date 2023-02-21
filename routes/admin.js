const router = require("express").Router();
const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

//
router.get("/Orders", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
