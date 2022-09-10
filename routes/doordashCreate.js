const DoorDashClient = require("@doordash/sdk");
const uuidv4 = require("uuid").v4;

const client = new DoorDashClient.DoorDashClient({
  developer_id: process.env.DEVELOPER_DOORDASH,
  key_id: process.env.ACCESS_DOORDASH,
  signing_secret: process.env.SECRET_DOORDASH,
});

const response = client
  .createDelivery({
    external_delivery_id: uuidv4(),
    pickup_address: "1000 4th Ave, Seattle, WA, 98104",
    pickup_phone_number: "+1(650)5555555",
    dropoff_address: "1201 3rd Ave, Seattle, WA, 98101",
    dropoff_phone_number: "+1(650)5555555",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

console.log(response);

// const axios = require("axios");

// const body = JSON.stringify({
//   external_delivery_id: "D-12345",
//   pickup_address: "901 Market Street 6th Floor San Francisco, CA 94103",
//   pickup_business_name: "Wells Fargo SF Downtown",
//   pickup_phone_number: "+16505555555",
//   pickup_instructions: "Enter gate code 1234 on the callbox.",
//   dropoff_address: "901 Market Street 6th Floor San Francisco, CA 94103",
//   dropoff_business_name: "Wells Fargo SF Downtown",
//   dropoff_phone_number: "+16505555555",
//   dropoff_instructions: "Enter gate code 1234 on the callbox.",
//   order_value: 1999,
// });

// axios
//   .post("https://openapi.doordash.com/drive/v2/deliveries", body, {
//     headers: {
//       Authorization: "Bearer " + token,
//       "Content-Type": "application/json",
//     },
//   })
//   .then(function (response) {
//     console.log(response.data);
//   })
//   .catch(function (error) {
//     console.log(error);
//   });
