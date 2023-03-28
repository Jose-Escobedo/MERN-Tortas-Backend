require("dotenv").config();
const KEY = process.env.SECRET_STRIPE;
const express = require("express");
const app = express();
const Order = require("../models/Order");
const router = require("express").Router();
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const jwt = require("jsonwebtoken");
const axios = require("axios");
const uuidv4 = require("uuid").v4;
const nodeMailer = require("nodemailer");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3006",
  },
});

const accessKey = {
  developer_id: process.env.DEVELOPER_DOORDASH,
  key_id: process.env.ACCESS_DOORDASH,
  signing_secret: process.env.SECRET_DOORDASH,
};

const data = {
  aud: "doordash",
  iss: accessKey.developer_id,
  kid: accessKey.key_id,
  exp: Math.floor(Date.now() / 1000 + 600),
  iat: Math.floor(Date.now() / 1000),
};

const headers = { algorithm: "HS256", header: { "dd-ver": "DD-JWT-V1" } };

const token = jwt.sign(
  data,
  Buffer.from(accessKey.signing_secret, "base64"),
  headers
);

const stripe = require("stripe")(KEY);

async function sendEmail(sentOrderInfo) {
  const productHtml = sentOrderInfo[0].products.map((item) => {
    return `<div>
    <h2 style="font-weight:700;">${item.quantity} X ${
      item.name
    } $${item.price.toFixed(2)}</h2>
    <h2>EXTRAS:</h2>
    <h2 style="font-weight:300;">${item.extras.map(
      (extra) => `${extra},
    `
    )}</h2>
    <h2>VARIATION:</h2>
    <h2 style="font-weight:300;">${item.itemCombo[0]?.firstItem.replace(
      /-/g,
      " "
    )}</h2>
    <h2 style="font-weight:300;">${item.variety[0]?.firstItem}</h2>
    <h2 style="font-weight:300;">${item.itemCombo[0]?.secondItem.replace(
      /-/g,
      " "
    )}</h2>
    <h2 style="font-weight:300;">${item.variety[0]?.secondItem}</h2>
    <h2>NOTE:</h2>
    <h2 style="font-weight:300;">${item.note}</h2>
   </div>`;
  });

  let TrackingLink;
  if (sentOrderInfo[0].doordashTrackingLink === "pending") {
    TrackingLink = "pending";
  } else {
    TrackingLink = sentOrderInfo[0].doordashTrackingLink;
  }

  const Email = `
  <html style="font-family: 'Montserrat', sans-serif;">
  <head><link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700&display=swap" rel="stylesheet">
  </head>
 <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; border: 1px solid grey; border-top:none;border-left:none;border-right:none">
   <img style="padding: 10px"src="https://firebasestorage.googleapis.com/v0/b/tortas-bffc7.appspot.com/o/tortaslogo.svg?alt=media&token=de3cbe59-838d-4539-b764-e0eb35710c6d" width= "50px">
   <h1>Tortas Mexico Studio City</h1>
 </div>
 <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; padding:20px; background-color:#F8F8FF;">
   <h1>Hello, ${sentOrderInfo[0].dropoff_contact_given_name}</h1>
   <h2>Thank you so much for your order!</h2>
   <div>
   ${TrackingLink}
   <div>
 </div>
 <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; padding:20px; background-color:#F8F8FF;">
   <h1 style="font-weight:700; border-bottom:1px solid black">ORDER SUMMARY:</h1>
   ${productHtml}
   <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; padding:20px">
    <h2>Order Total: ${sentOrderInfo[0].total.toFixed(2)}</h2>
   </div>
 </div>

 <footer style="display: flex; flex-direction:column; justify-content:center; align-items:center; padding:20px;  border: 1px solid grey;border-left:none;border-right:none; border-bottom:none"><a style=" 
  text-decoration: none; color:teal; padding-bottom:10px;" 
  href="https://www.google.com/maps/place/Tortas+Mexico+Restaurant/@34.140505,-118.3736457,17z/data=!3m1!4b1!4m5!3m4!1s0x80c2be150a3a4a87:0x4bb0951e3b36f3c2!8m2!3d34.1405406!4d-118.3715541?hl=en">
            11040 Ventura Blvd, Studio City CA 91604
          </a>
          <a href="tel:+18187602571" style=" text-decoration: none; color: teal; padding-bottom:10px;">
            +1 (818) 760-2571
          </a>
          <a style=" text-decoration: none; color:teal; padding-bottom:10px;" href="https://www.tortasmexico-studiocity.com">
            tortasmexico-studiocity.com
          </a>
          <a href="mailto:support@tortasmexico-studiocity.com" style=" text-decoration: none; color:teal;">
            support@tortasmexico-studiocity.com
          </a>
 </footer>
</html>
  
`;
  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: `${process.env.EMAIL_USER}`,
      pass: `${process.env.EMAIL_PASS}`,
    },
  });

  const info = await transporter.sendMail({
    from: "Tortas Mexico Studio City <support@tortasmexico-studiocity.com>",
    to: sentOrderInfo[0].email,
    subject: "Thank You For Your Order!",
    html: Email,
  });
  console.log("Message Sent: " + info.messageId);
}

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
            images: [
              "https://firebasestorage.googleapis.com/v0/b/tortas-bffc7.appspot.com/o/tortaslogo.jpg?alt=media&token=124e2ade-1541-4831-89a1-a3f655c56b9bcd",
            ],
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
    const updatedOrder = await Order.findByIdAndUpdate(orderLinker, {
      payment_status: "paid",
    });
    console.log(orderLinker);
  } catch (error) {
    console.log(error);
  }
};

const doordashDelivery = async (customer, data) => {
  const orderLinker = customer.metadata.stripeIdentifier;
  try {
    const sentOrderInfo = await Order.find({ _id: orderLinker });
    const pickupBoolean = sentOrderInfo[0].pickup;
    if (pickupBoolean) {
      console.log("This is a pickup order!");
      sendEmail(sentOrderInfo).catch((e) => console.log(e));
    } else {
      handleDeliveryRequest(sentOrderInfo);
      sendEmail(sentOrderInfo).catch((e) => console.log(e));
    }
  } catch (error) {
    console.log(error);
  }
};

const handleDoordashId = async (res, id) => {
  try {
    const UpdatedOrderId = await Order.findByIdAndUpdate(id, {
      doordashSupportId: res.data.support_reference,
    });
    console.log(id);
  } catch (error) {
    console.log(error);
  }
};

const handleDoordashTracking = async (res, id) => {
  try {
    const UpdatedOrderTracking = await Order.findByIdAndUpdate(id, {
      doordashTrackingLink: res.data.tracking_url,
    });
    console.log(id);
  } catch (error) {
    console.log(error);
  }
};

const handleDeliveryRequest = (sentOrderInfo) => {
  const toCent = (item) => {
    const str = item.toString();
    const int = str.split(".");

    return Number(item.replace(".", "").padEnd(int.length === 1 ? 3 : 4, "0"));
  };
  const body = JSON.stringify({
    external_delivery_id: String(sentOrderInfo[0]._id),
    pickup_address: "11040 Ventura Blvd Studio City, CA 91604",
    pickup_business_name: "Tortas Mexico Studio City",
    pickup_phone_number: "+18187602571",
    pickup_instructions: "Located in Plaza next to Super Cuts.",
    dropoff_address: sentOrderInfo[0].address,
    dropoff_business_name: sentOrderInfo[0].dropoff_contact_given_name,
    dropoff_phone_number: sentOrderInfo[0].phone,
    dropoff_instructions: sentOrderInfo[0].dropoff_instructions,
    tip: sentOrderInfo[0].tip * 100,
    order_value: sentOrderInfo[0].total * 100,
  });

  axios
    .post("https://openapi.doordash.com/drive/v2/deliveries", body, {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
    })
    .then(function (response) {
      console.log(response);
      handleDoordashId(response, String(sentOrderInfo[0]._id));
      handleDoordashTracking(response, String(sentOrderInfo[0]._id));
    })
    .catch(function (error) {
      console.log(error);
    });
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
        doordashDelivery(customer, data);
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
