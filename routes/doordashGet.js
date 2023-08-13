const DoorDashClient = require("@doordash/sdk");

const client = new DoorDashClient.DoorDashClient({
  developer_id: process.env.DEVELOPER_DOORDASH,
  key_id: process.env.ACCESS_DOORDASH,
  signing_secret: process.env.SECRET_DOORDASH,
});

const response = client
  .getDelivery("64b0a813594cca17730b0a9e")
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

console.log(response);
