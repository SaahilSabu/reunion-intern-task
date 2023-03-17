const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    postBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    desc: {
      type: String,
      max: 500,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    likes: {
      type: Array,
      default: [],
    },
    comments: [
      {
        comment: String,
        commentBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
