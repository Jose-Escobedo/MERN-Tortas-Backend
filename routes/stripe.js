require("dotenv").config();
const KEY = process.env.SECRET_STRIPE;
const express = require("express");
const app = express();
const Order = require("../models/Order");
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
  function selectProps(...props) {
    return function (obj) {
      const newObj = {};
      props.forEach((name) => {
        newObj[name] = obj[name];
      });

      return newObj;
    };
  }

  const smallCharCart = req.body.cart.products.map(
    selectProps("name", "quantity")
  );

  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      products: JSON.stringify(smallCharCart),
      address: req.body.address,
      phone: req.body.phone,
      tip: req.body.tip,
      subtotal: req.body.subtotal,
      taxes: req.body.taxes,
      totalWithTip: req.body.totalWithTip,
      email: req.body.email,
    },
  });

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
    customer: customer.id,
    mode: "payment",
    success_url: `http://localhost:3006/success`,
    cancel_url: `http://localhost:3006/checkout`,
  });
  res.json({ url: session.url, contact: session.contact });
});

//create Order
const createOrder = async (customer, data) => {
  const cartItems = JSON.parse(customer.metadata.products);

  const newOrder = new Order({
    userId: customer.metadata.userId,
    customerId: data.customer,
    paymentIntentId: data.payment_intent,
    products: cartItems,
    subtotal: customer.metadata.subtotal,
    total: data.amount_total,
    address: customer.metadata.address,
    phone: customer.metadata.phone,
    tip: customer.metadata.tip,
    taxes: customer.metadata.taxes,
    totalWithTip: customer.metadata.totalWithTip,
    email: customer.metadata.email,
    payment_status: data.payment_status,
  });

  try {
    const savedOrder = await newOrder.save();
    console.log("Processed Order:", savedOrder);
  } catch (error) {
    console.log(error);
  }
};

// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
endpointSecret =
  "whsec_bd73383ed0fcf9cfb27bd4929af341605ad32577dfd8825e1143425b846bb3c3";

router.post("/webhook", (request, response) => {
  const sig = request.headers["stripe-signature"];

  let data;
  let eventType;

  if (endpointSecret) {
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

    data = event.data.object;
    eventType = event.type;
  } else {
    data = request.body.data.object;
    eventType = request.body.type;
  }

  // Handle the event
  if (eventType === "checkout.session.completed") {
    stripe.customers
      .retrieve(data.customer)
      .then((customer) => {
        // console.log(customer);
        // console.log("data:", data);
        createOrder(customer, data);
      })
      .catch((err) => console.log(err.message));
  }

  // switch (event.type) {
  //   case "checkout.session.completed":
  //     const paymentIntent = event.data.object;
  //     // Then define and call a function to handle the event payment_intent.succeeded

  //     break;
  //   // ... handle other event types
  //   default:
  //     console.log(`Unhandled event type ${event.type}`);
  // }

  // Return a 200 response to acknowledge receipt of the event
  response.send().end();
});

module.exports = router;
