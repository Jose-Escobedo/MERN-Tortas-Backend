const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    name: req.body.name,
    lastname: req.body.lastname,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_PASS
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  try {
    console.log("user:-", req.body.username);

    User.findOne({ username: req.body.username }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: "User with that email does not exist. Please signup",
        });
      }
      const hashedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.SECRET_PASS
      );
      const OriginalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

      if (OriginalPassword !== req.body.password) {
        return res.status(401).json("Wrong credentials!");
      }

      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
      );
      const refreshToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      const { password, ...others } = user._doc;
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ ...others, accessToken });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGOUT

router.get("/logout", async (req, res) => {
  try {
    res.clearCookie("jwt");
    console.log("logout");
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
