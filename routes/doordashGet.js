const DoorDashClient = require("@doordash/sdk");

const client = new DoorDashClient.DoorDashClient({
  developer_id: process.env.DEVELOPER_DOORDASH,
  key_id: process.env.ACCESS_DOORDASH,
  signing_secret: process.env.SECRET_DOORDASH,
});

const response = client
  .getDelivery("181f937f-71c7-4a2b-b7ac-49ed10f10a87")
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

console.log(response);
