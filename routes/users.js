const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");
const { verifyToken } = require("./verifyToken");
//get a user
router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { username, followers, followings, ...other } = user._doc;
    // console.log(username)
    res.status(200).json({
      username,
      followers: followers.length,
      followings: followings.length,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//follow a user

router.put("/follow/:id", verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);
      if (!user.followers.includes(req.user.id)) {
        await user.updateOne({ $push: { followers: req.user.id } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        res.status(403).json("you already follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});

//unfollow a user

router.put("/unfollow/:id", verifyToken, async (req, res) => {
  if (req.user.id !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user.id);
      if (user.followers.includes(req.user.id)) {
        await user.updateOne({ $pull: { followers: req.user.id } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        res.status(403).json("you dont follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant unfollow yourself");
  }
});

module.exports = router;
