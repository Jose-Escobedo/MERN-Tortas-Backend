const router = require("express").Router();

router.get("/usertest", (req, res) => {
  res.send("USER CONNECTION IS SUCCESSFUL");
});

module.exports = router;
