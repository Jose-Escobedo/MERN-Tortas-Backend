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
