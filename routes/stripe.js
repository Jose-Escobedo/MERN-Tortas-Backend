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
const moment = require("moment-timezone");

const accessKey = {
  developer_id: process.env.DEVELOPER_DOORDASH,
  key_id: process.env.ACCESS_DOORDASH,
  signing_secret: process.env.SECRET_DOORDASH,
};

const data = {
  aud: "doordash",
  iss: process.env.DEVELOPER_DOORDASH,
  kid: process.env.ACCESS_DOORDASH,
  exp: Math.floor(Date.now() / 1000 + 600),
  iat: Math.floor(Date.now() / 1000),
};

const headers = { algorithm: "HS256", header: { "dd-ver": "DD-JWT-V1" } };

const token = jwt.sign(
  data,
  Buffer.from(process.env.SECRET_DOORDASH, "base64"),
  headers
);

const stripe = require("stripe")(KEY);

async function sendEmail(sentOrderInfo) {
  let note;
  let extras;
  let itemComboOne;
  let itemVarietyOne;
  let itemComboTwo;
  let itemVarietyTwo;
  let Pickup;
  let PickupDate;
  let PickupTime;
  let deliveryFee;
  let date;
  date = moment();
  moment(date).utcOffset("-0400").format("MM.DD. h:mm A");

  if (sentOrderInfo[0].pickup) {
    deliveryFee = "";
  } else {
    deliveryFee = `<h2 style="font-size:1rem">Delivery Fee: $ 4.99</h2>`;
  }

  if (sentOrderInfo[0].pickup_date) {
    let formattedDate;

    if (sentOrderInfo[0].pickup_date === "today") {
      formattedDate = sentOrderInfo[0].pickup_date;
    } else {
      formattedDate = moment(formattedDate).format("MM.DD. h:mm A");
    }

    PickupDate = `<h2 style="font-weight:300;font-size:.8rem;">${formattedDate}</h2>`;
  } else {
    PickupDate = "";
  }

  if (sentOrderInfo[0].pickup_time) {
    PickupTime = `<h2 style="font-weight:300;font-size:.8rem;">${sentOrderInfo[0].pickup_date}</h2>`;
  } else {
    PickupTime = "";
  }

  if (sentOrderInfo[0].address === "11040 Ventura Blvd Studio City, CA 91604") {
    Pickup = `<h2 style="font-size:1.2rem;">PICKUP</h2>`;
  } else {
    Pickup = `<h2 style="font-size:1.2rem;">DELIVERY</h2>
    <h2  style="font-size:1rem; text-align: center;">${sentOrderInfo[0].address}</h2>
    `;
  }

  const productHtml = sentOrderInfo[0].products
    .map((item) => {
      if (
        !item.note ||
        item.note === "" ||
        item.note[0] === "" ||
        item.note.length === 0
      ) {
        note = "";
      } else {
        note = `   <h2 style="font-size:1rem;">NOTE:</h2>
        <h2 style="font-weight:300; font-size:1rem;">${item.note}</h2>`;
      }

      if (
        !item.itemCombo[0]?.firstItem ||
        item.itemCombo[0]?.firstItem === ""
      ) {
        itemComboOne = "";
      } else {
        itemComboOne = `   <h2 style="font-size:1rem;">VARIATION:</h2>
        <h2 style="font-weight:300; font-size:1rem;">${item.itemCombo[0]?.firstItem.replace(
          /-/g,
          " "
        )}</h2>`;
      }
      if (!item.variety[0]?.firstItem || item.variety[0]?.firstItem === "") {
        itemVarietyOne = "";
      } else {
        itemVarietyOne = `<h2 style="font-weight:300; font-size:1rem;">${item.variety[0]?.firstItem.replace(
          /-/g,
          " "
        )}</h2>`;
      }
      if (
        !item.itemCombo[0]?.secondItem ||
        item.itemCombo[0]?.secondItem === ""
      ) {
        itemComboTwo = "";
      } else {
        itemComboTwo = `<h2 style="font-weight:300; font-size:1rem;">${item.itemCombo[0]?.secondItem.replace(
          /-/g,
          " "
        )}</h2>`;
      }
      if (!item.variety[0]?.secondItem || item.variety[0]?.secondItem === "") {
        itemVarietyTwo = "";
      } else {
        itemVarietyTwo = `<h2 style="font-weight:300; font-size:1rem;">${item.variety[0]?.secondItem.replace(
          /-/g,
          " "
        )}</h2>`;
      }

      if (item.extras.length == 0 || item.extras[0] == "") {
        extras = "";
      } else {
        extras = `  <h2 style="font-size:1rem;">EXTRAS:</h2>
        <h2 style="font-weight:300; font-size:1rem;">${item.extras.map(
          (extra) => `${extra}<br>`
        )}</h2>`;
      }

      return `<div style = "border-bottom: 1px solid black;">
    <h2 style="font-weight:700;">${item.quantity} X ${
        item.name
      } $${item.price.toFixed(2)}</h2>
      ${itemComboOne}
      ${itemVarietyOne}
      ${itemComboTwo}
      ${itemVarietyTwo}
      ${extras}
      ${note}
   </div>`;
    })
    .join("<br>");

  const Email = `
  <html style="font-family: 'Montserrat', sans-serif;">
  <head><link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;700&display=swap" rel="stylesheet">
  </head>
 <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; border: 1px solid grey; border-top:none;border-left:none;border-right:none">
   <img style="padding: 10px"src="https://firebasestorage.googleapis.com/v0/b/tortas-bffc7.appspot.com/o/tortaslogo.svg?alt=media&token=de3cbe59-838d-4539-b764-e0eb35710c6d" width= "50px">
   <h1 style="font-size:1.2rem;">Tortas Mexico Studio City</h1>
 </div>
 <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; padding:20px; background-color:#F8F8FF;">
   <h1 style="font-size:1.5rem;">Hello, ${
     sentOrderInfo[0].dropoff_contact_given_name
   }</h1>
   <h2 style="font-size:1rem;">Thank you so much for your order!</h2>
   <h2 style="font-size:1rem;">ORDER CREATED AT:</h2> 
   <h2 style="font-size:1rem; text-align: center;">${moment(date)
     .utcOffset("-0700")
     .format("MM.DD. h:mm A")}
  </h2>

  ${Pickup}
  ${PickupDate}
  ${PickupTime}
  <h1 style="font-weight:700; font-size: 1rem;">Order ID #:</h1>
  <h2 style="font-weight:300; font-size: 1rem;">${sentOrderInfo[0]._id}</h2>
  <br></br>
 </div>
 <div style="display: flex; flex-direction:column;   padding:20px; background-color:#F8F8FF;">
    <div style=" margin: auto">
      <h1 style="font-weight:700; font-size: 2rem; border-bottom:1px solid black;">ORDER SUMMARY:</h1>
   </div>
 
   ${productHtml}
   <div>
   <h2 style="font-size:1rem">Subtotal: $ ${sentOrderInfo[0].subtotal.toFixed(
     2
   )}</h2>
  
      <h2 style="font-size:1rem">Taxes: $ ${sentOrderInfo[0].taxes.toFixed(
        2
      )}</h2>
      ${deliveryFee}
      <h2 style="font-size:1rem">Tip: $ ${sentOrderInfo[0].tip}</h2>
   </div>
   <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; padding:20px">
    <h2>Order Total: $ ${sentOrderInfo[0].total.toFixed(2)}</h2>
    <h1 style="font-size:1rem">Want to track your order?</h1>
    <h2 style="font-size:.8rem">Simply, copy and paste your order # into our <a href="https://www.tortasmexico-studiocity.com/order-lookup">Order Lookup</a> page on our website.</h2>
   </div>
 </div>

 <div style="display: flex; flex-direction:column; justify-content:center; align-items:center; padding:20px;  border: 1px solid grey;border-left:none;border-right:none; border-bottom:none;"><a style=" 
  text-decoration: none; color:teal; padding-bottom:10px; font-size:.8rem;" 
  href="https://www.google.com/maps/place/Tortas+Mexico+Restaurant/@34.140505,-118.3736457,17z/data=!3m1!4b1!4m5!3m4!1s0x80c2be150a3a4a87:0x4bb0951e3b36f3c2!8m2!3d34.1405406!4d-118.3715541?hl=en">
            11040 Ventura Blvd, Studio City CA 91604
          </a>
          <br></br>
          <a href="tel:+18187602571" style="font-size:.8rem; text-decoration: none; color: teal; padding-bottom:10px;">
            +1 (818) 760-2571
          </a>
          <br></br>
          <a style="font-size:.8rem; text-decoration: none; color:teal; padding-bottom:10px;" href="https://www.tortasmexico-studiocity.com">
            tortasmexico-studiocity.com
          </a>
          <br></br>
          <a href="mailto:support@tortasmexico-studiocity.com" style="font-size:.8rem; text-decoration: none; color:teal;">
            support@tortasmexico-studiocity.com
          </a>
 </div>
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
    success_url: `https://www.tortasmexico-studiocity.com/success`,
    cancel_url: `https://www.tortasmexico-studiocity.com/cart`,
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

//Handle Customer Stripe Id
const handleCustomerStripeId = async (customer, data) => {
  const orderLinker = customer.metadata.stripeIdentifier;
  try {
    const UpdatedCustomerStripeId = await Order.findByIdAndUpdate(orderLinker, {
      customerId: customer.id,
    });
    console.log(id);
  } catch (error) {
    console.log(error);
  }
};

//Handle payment Intent Id
const handlePaymentIntentId = async (customer, data) => {
  const orderLinker = customer.metadata.stripeIdentifier;
  try {
    const UpdatedPaymentIntent = await Order.findByIdAndUpdate(orderLinker, {
      paymentIntentId: data.payment_intent,
    });
    console.log(UpdatedPaymentIntent);
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
      console.log("This is a pickup order!!");
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

router.post("/webhook", (request, response) => {
  let endpointSecret;
  endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
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
        handleCustomerStripeId(customer, data);
        handlePaymentIntentId(customer, data);
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
