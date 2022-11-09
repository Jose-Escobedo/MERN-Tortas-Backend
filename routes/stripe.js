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
  console.log(req.body.contact);
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
            description: `${req.body.cart.products.map(
              (item) => ` (${item.quantity}x) ${item.name}`
            )}`,
            images: ["https://i.ibb.co/V38LgNJ/tortaslogo-padding.jpg"],
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `http://localhost:3006/success`,
    cancel_url: `http://localhost:3006/checkout`,
  });
  res.json({ url: session.url, contact: session.contact });
});

const express = require("express");
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret =
  "whsec_bd73383ed0fcf9cfb27bd4929af341605ad32577dfd8825e1143425b846bb3c3";

router.post("/webhook", (request, response) => {
  const sig = request.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      endpointSecret
    ); //@JA - Had to modify this to take the rawBody since this is what was needed.
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      console.log(paymentIntent);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

module.exports = router;
