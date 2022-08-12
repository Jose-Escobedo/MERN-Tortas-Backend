const router = require("express").Router();
const DoorDashClient = require("@doordash/sdk");
const uuidv4 = require("uuid").v4;

router.post("/get-delivery-rate", async (req, res) => {
  const client = new DoorDashClient.DoorDashClient({
    developer_id: process.env.DEVELOPER_DOORDASH,
    key_id: process.env.ACCESS_DOORDASH,
    signing_secret: process.env.SECRET_DOORDASH,
  });

  const response = await client.deliveryQuote({
    external_delivery_id: uuidv4(),
    pickup_address: "1000 4th Ave, Seattle, WA, 98104",
    pickup_phone_number: "+1(650)5555555",
    dropoff_address: "1201 3rd Ave, Seattle, WA, 98101",
    dropoff_phone_number: "+1(650)5555555",
  });
  res.send(response);
  console.log(response);
});

router.post("/create-delivery", async (req, res) => {
  const client = new DoorDashClient.DoorDashClient({
    developer_id: process.env.DEVELOPER_DOORDASH,
    key_id: process.env.ACCESS_DOORDASH,
    signing_secret: process.env.SECRET_DOORDASH,
  });

  const response = await client.deliveryQuoteAccept(
    "ff3f2cd7-71b9-408a-bdb7-d8c159ac27a1"
  );
  res.send(response);
  console.log(response);
});

module.exports = router;
