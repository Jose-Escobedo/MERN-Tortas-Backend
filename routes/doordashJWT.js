const jwt = require("jsonwebtoken");
const axios = require("axios");

const accessKey = {
  developer_id: process.env.DEVELOPER_DOORDASH,
  key_id: process.env.ACCESS_DOORDASH,
  signing_secret: process.env.SECRET_DOORDASH,
};

const data = {
  aud: "doordash",
  iss: accessKey.developer_id,
  kid: accessKey.key_id,
  exp: Math.floor(Date.now() / 1000 + 60),
  iat: Math.floor(Date.now() / 1000),
};

const headers = { algorithm: "HS256", header: { "dd-ver": "DD-JWT-V1" } };

const token = jwt.sign(
  data,
  Buffer.from(accessKey.signing_secret, "base64"),
  headers
);

const body = JSON.stringify({
  external_delivery_id: "D-123456",
  pickup_address: "901 Market Street 6th Floor San Francisco, CA 94103",
  pickup_business_name: "Wells Fargo SF Downtown",
  pickup_phone_number: "+16505555555",
  pickup_instructions: "Enter gate code 1234 on the callbox.",
  dropoff_address: "901 Market Street 6th Floor San Francisco, CA 94103",
  dropoff_business_name: "Wells Fargo SF Downtown",
  dropoff_phone_number: "+16505555555",
  dropoff_instructions: "Enter gate code 1234 on the callbox.",
  order_value: 1999,
});

axios
  .post("https://openapi.doordash.com/drive/v2/deliveries", body, {
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
  })
  .then(function (response) {
    console.log(response.data);
  })
  .catch(function (error) {
    console.log(error);
  });
