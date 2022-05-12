const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    posterId: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    picture: {
      type: String,
    },
    video: {
      type: String,
      default: "",
    },
    likers: {
      type: [String],
      required: true,
      default: [],
    },
    comments: {
      type: [
        {
          commenterId: String,
          commenterPseudo: String,
          comment: String,
          timestamp: Number,
        },
      ],
      default: [],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", PostSchema);
