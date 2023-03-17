const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");
const { verifyToken } = require("./verifyToken");
const mongoose = require("mongoose");
const toId = mongoose.Types.ObjectId;

//create a post
router.post("/posts/", verifyToken, async (req, res) => {
  const newPost = new Post({ ...req.body, postBy: req.user.id });
  try {
    const savedPost = await newPost.save();
    const { postBy, likes, __v, updatedAt, comments, ...other } =
      savedPost._doc;

    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get post
router.get("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("comments");
    const { likes, comments, ...other } = post._doc;
    const commentList = comments.map((comment) => comment.comment);

    res.status(200).json({ likes: likes.length, comments: commentList });
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete
router.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.postBy == req.user.id) {
      await post.deleteOne();
      res.status(200).json("the post has been deleted");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//like / dislike a post

router.put("/like/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      await post.updateOne({ $push: { likes: req.user.id } });
      res.status(200).json("The post has been liked");
    } else {
      res.status(200).json("The post has been liked already");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
router.put("/unlike/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.likes.includes(req.user.id)) {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.status(200).json("The post has been disliked");
    } else {
      res.status(200).json("The post has been disliked already");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//add comments
router.put("/comment/:id", verifyToken, async (req, res) => {
  const comment = {
    comment: req.body.comment,
    commentBy: req.user.id,
  };
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { comments: comment } },
      { new: true }
    );
    res.status(200).json({ commentID: post.comments.pop()._id });
  } catch (err) {
    res.status(500).json(err);
  }
});

//all post
router.get("/all_posts/", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ postBy: req.user.id });
    const result = posts.map((post) => {
      const { _id, title, desc, createdAt, likes, comments, ...other } =
        post._doc;
      const commentList = comments.map((comment) => comment.comment);
      return {
        _id,
        title,
        desc,
        createdAt,
        likes: likes.length,
        comments: commentList,
      };
    });
    // console.log(result);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
