const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//REGISTER
router.post("/register", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN
router.post("/authenticate", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }); //checking for using by comparing email

    !user && res.status(401).json("Wrong Credentials"); //if user does not exist or email doesnt match

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(401).json("Wrong Credentials"); //if passwords dont match

    const accessToken = jwt.sign(
      //gives access token
      {
        id: user._id,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    res.status(200).json({ accessToken }); //if all okay! send user detials as json and also web token
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
