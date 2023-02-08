require("dotenv").config();
const KEY = process.env.SECRET_STRIPE;
const express = require("express");
const app = express();
const Order = require("../models/Order");
const router = require("express").Router();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3006",
  },
});

// This is a public sample test API key.
// Don’t submit any personally identifiable information in requests made with this key.
// Sign in to see your own test API key embedded in code samples.
const stripe = require("stripe")(KEY);

// const calculateOrderAmount = (items) => {
//   return 1400;
// };

// router.post("/create-payment-intent", async (req, res) => {
//   const { items } = req.body;

//   // Create a PaymentIntent with the order amount and currency
//   const paymentIntent = await stripe.paymentIntents.create({
//     amount: calculateOrderAmount(),
//     currency: "usd",
//     automatic_payment_methods: {
//       enabled: true,
//     },
//   });

//   res.send({
//     clientSecret: paymentIntent.client_secret,
//   });
// });

router.post("/payment", async (req, res) => {
  // function selectProps(...props) {
  //   return function (obj) {
  //     const newObj = {};
  //     props.forEach((name) => {
  //       newObj[name] = obj[name];
  //     });

  //     return newObj;
  //   };
  // }

  // const smallCharCart = req.body.cart.products.map(
  //   selectProps("name", "quantity")
  // );

  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      stripeIdentifier: req.body.idForStripe,
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
    cancel_url: `http://localhost:3006/cart`,
  });
  res.json({ url: session.url, contact: session.contact });
});

//Update To Paid
const updatePaymentStatus = async (customer, data) => {
  const orderLinker = customer.metadata.stripeIdentifier;
  try {
    Order.findOneAndUpdate(
      { idForStripe: orderLinker },
      { payment_status: "paid" }
    );
    console.log(orderLinker);
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
        console.log("customer:", customer);
        console.log("data:", data);
        updatePaymentStatus(customer, data);
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
