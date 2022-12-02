const DoorDashClient = require("@doordash/sdk");

const client = new DoorDashClient.DoorDashClient({
  developer_id: process.env.DEVELOPER_DOORDASH,
  key_id: process.env.ACCESS_DOORDASH,
  signing_secret: process.env.SECRET_DOORDASH,
});

const response = client
  .getDelivery("06860d9d-e1f3-4e2f-9857-b23eba9e6cf9")
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

console.log(response);
