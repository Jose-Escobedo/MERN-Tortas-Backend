require("dotenv").config();
const KEY = process.env.SECRET_STRIPE;
const router = require("express").Router();
// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")(KEY);

// const calculateOrderAmount = (items) => {
//   // Replace this constant with a calculation of the order's amount
//   // Calculate the order total on the server to prevent
//   // people from directly manipulating the amount on the client
//   console.log(items);
//   return items;
// };

router.post("/payment", async (req, res) => {
  const { line_items } = req.body;
  console.log(req.body.cart);
  const toCent = (item) => {
    const str = item.toString();
    const int = str.split(".");

    return Number(item.replace(".", "").padEnd(int.length === 1 ? 3 : 4, "0"));
  };
  // Create a PaymentIntent with the order amount and currency
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: toCent(req.body.total),
          product_data: {
            name: "Order Total",
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:3006/success`,
    cancel_url: `http://localhost:3006/cancel`,
  });
  res.json({ url: session.url });
});

module.exports = router;
