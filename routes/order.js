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
  const newOrder = Order({
    userId: req.body.userId,
    products: req.body.products,
    total: req.body.total,
    subtotal: req.body.subtotal,
    totalWithTip: req.body.totalWithTip,
    pickup_instructions: req.body.pickup_instructions,
    dropoff_instructions: req.body.dropoff_instructions,
    pickup_instructions: req.body.pickup_instructions,
    dropoff_contact_given_name: req.body.dropoff_contact_given_name,
    dropoff_contact_family_name: req.body.dropoff_contact_family_name,
    address: req.body.address,
    tip: req.body.tip,
    taxes: req.body.taxes,
    phone: req.body.phone,
    email: req.body.email,
    pickup: req.body.pickup,
  });
  // const allSendDataToDb = req.body.products;
  // const priceFromFront = req.body.total;
  // const totalWithTips = req.body.totalWithTip;
  // const tip = req.body.tip;
  // //console.log("totalwithtip", req.body.totalWithTip);
  try {
    //   const allProducts = await Product.find({ _id: { $in: allSendDataToDb } });
    //   //console.log(allProducts);
    //   let totalResultDb = 0;
    //   let flag = 0;
    //   for (let index = 0; index < allSendDataToDb.length; index++) {
    //     //const element = allSendDataToDb[index];

    //     let subtotal = 0;
    //     for (let index2 = 0; index2 < allProducts.length; index2++) {
    //       subtotal =
    //         subtotal +
    //         allProducts[index2].price * allSendDataToDb[index2].quantity;
    //       // console.log("** ", allSendDataToDb[index].price);
    //       //console.log("**222 ", allProducts[index2].price);
    //       let tax = subtotal * 0.095;
    //       totalResultDb = subtotal + tax + 4.99;
    //       // console.log("sub", subtotal.toFixed(2));

    //       if (
    //         allSendDataToDb[index]._id === allProducts[index2]._id.toString() &&
    //         allSendDataToDb[index].price === allProducts[index2].price
    //       ) {
    //         flag = 1;
    //       }
    //     }

    //     if (flag === 0) {
    //       return res.status(500).json({ msg: "data price don't match" });
    //     }
    //   }
    //   //console.log("tt", typeof tip);
    //   if (tip !== 0) {
    //     totalResultDb = totalResultDb + parseFloat(tip);
    //   }
    //   if (
    //     priceFromFront.toFixed(2) === totalResultDb.toFixed(2) ||
    //     totalResultDb.toFixed(2) === totalWithTips.toFixed(2)
    //   ) {
    //     //console.log("priceFromFront", priceFromFront.toFixed(2));
    //     //console.log("total", totalResultDb.toFixed(2));
    //     flag = 1;
    //   } else {
    //     return res
    //       .status(500)
    //       .json({ msg: "Prices do not match database. Please retry." });
    //   }

    const savedOrder = await newOrder.save();
    return res.status(200).json(savedOrder);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

//Update
// router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const updatedOrder = await Order.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedOrder);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// Update to Paid with params
// router.put("/:id", (req, res) => {
//   const updatedOrder = Order.findByIdAndUpdate(
//     req.params.id,
//     { payment_status: "paid" },
//     function (err, result) {
//       if (err) {
//         res.send(err);
//       } else {
//         res.send(result);
//       }
//     }
//   );
// });

// Update to Paid
router.put("/order-paid", (req, res) => {
  const updatedOrder = Order.findByIdAndUpdate(
    req.body.orderLinker,
    { payment_status: "paid" },
    function (err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
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
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//deletes Orders from a specific user without Auth postman

// router.delete("/find/:userId", async (req, res) => {
//   try {
//     const orders = await Order.find({ userId: req.params.userId });
//     Order.remove({ userId: req.params.userId }, function (err) {
//       if (err) throw err;
//     });
//     return res.status(200).json(orders);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//Get last 5 Orders
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const orders = query
      ? await Order.find().sort({ _id: -1 }).limit(5)
      : await Order.find();
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get Order by Id
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    return res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get All Orders
router.get("/Orders", verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    return res.status(200).json(orders);
  } catch (err) {
    return res.status(500).json(err);
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
