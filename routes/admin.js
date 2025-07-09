// const router = require("express").Router();
// const Order = require("../models/Order");
// const jwt = require("jsonwebtoken");
// const axios = require("axios");

// const accessKey = {
//   developer_id: process.env.DEVELOPER_DOORDASH,
//   key_id: process.env.ACCESS_DOORDASH,
//   signing_secret: process.env.SECRET_DOORDASH,
// };

// const data = {
//   aud: "doordash",
//   iss: accessKey.developer_id,
//   kid: accessKey.key_id,
//   exp: Math.floor(Date.now() / 1000 + 60),
//   iat: Math.floor(Date.now() / 1000),
// };

// const headers = { algorithm: "HS256", header: { "dd-ver": "DD-JWT-V1" } };

// const token = jwt.sign(
//   data,
//   Buffer.from(accessKey.signing_secret, "base64"),
//   headers
// );
// const {
//   verifyToken,
//   verifyTokenAndAuthorization,
//   verifyTokenAndAdmin,
// } = require("./verifyToken");

// //
// router.get("/Orders", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     const orders = await Order.find();
//     return res.status(200).json(orders);
//   } catch (err) {
//     return res.status(500).json(err);
//   }
// });

// router.get("/doordashPatch", verifyTokenAndAdmin, async (req, res) => {
//   try {
//     return res.status(200).json(token);
//   } catch (err) {
//     console.log(err);
//   }
// });

// module.exports = router;
