const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

//Create
router.post("/", async (req, res) => {
  const newOrder = new Order({
    userId: req.body._id,
    products: req.body.products,
    total: req.body.total,
    totalWithTip: req.body.totalWithTip,
    address: req.body.address,
    tip: req.body.tip,
    taxes: req.body.taxes,
    phone: req.body.phone,
    email: req.body.email,
    status: "pending",
  });
  const allSendDataToDb = req.body.products;
  const priceFromFront = req.body.total;
  const totalWithTips = req.body.totalWithTip;
  const tip = req.body.tip;
  //console.log("totalwithtip", req.body.totalWithTip);
  try {
    const allProducts = await Product.find({ _id: { $in: allSendDataToDb } });
    //console.log(allProducts);
    let totalResultDb = 0;
    let flag = 0;
    for (let index = 0; index < allSendDataToDb.length; index++) {
      //const element = allSendDataToDb[index];

      let subtotal = 0;
      for (let index2 = 0; index2 < allProducts.length; index2++) {
        subtotal =
          subtotal +
          allProducts[index2].price * allSendDataToDb[index2].quantity;
        // console.log("** ", allSendDataToDb[index].price);
        //console.log("**222 ", allProducts[index2].price);
        let tax = subtotal * 0.095;
        totalResultDb = subtotal + tax + 4.99;
        // console.log("sub", subtotal.toFixed(2));

        if (
          allSendDataToDb[index]._id === allProducts[index2]._id.toString() &&
          allSendDataToDb[index].price === allProducts[index2].price
        ) {
          flag = 1;
        }
      }

      if (flag === 0) {
        return res.status(500).json({ msg: "data price don't match" });
      }
    }
    //console.log("tt", typeof tip);
    if (tip !== 0) {
      totalResultDb = totalResultDb + parseFloat(tip);
    }
    if (
      priceFromFront.toFixed(2) === totalResultDb.toFixed(2) ||
      totalResultDb.toFixed(2) === totalWithTips.toFixed(2)
    ) {
      //console.log("priceFromFront", priceFromFront.toFixed(2));
      //console.log("total", totalResultDb.toFixed(2));
      flag = 1;
    } else {
      return res
        .status(500)
        .json({ msg: "Prices do not match database. Please retry." });
    }
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Update
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Delete
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json("Order has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get User's Order
router.get("/find/:userId", verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    return res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get All Orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get Order Stats
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  try {
    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
