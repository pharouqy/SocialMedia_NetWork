const PostModel = require("../models/post.model");
const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const { uploadErrors } = require("../utils/errors.utils");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

module.exports.getAllPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("posterId", "-password")
      .sort({
        createdAt: -1,
      });
    res.status(200).send({ posts });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};

module.exports.createPost = async (req, res) => {
  let fileName;
  if (req.file !== null) {
    try {
      if (
        req.file.detectedMimeType !== "image/jpeg" &&
        req.file.detectedMimeType !== "image/jpg" &&
        req.file.detectedMimeType !== "image/png" &&
        req.file.detectedMimeType !== "image/gif"
      ) {
        throw new Error("invalid file");
      }
      if (req.file.size > 1000000) {
        throw new Error("max size");
      }
    } catch (error) {
      const errors = uploadErrors(error);
      res.status(400).send({ errors });
      return;
    }
    fileName = req.body.posterId + Date.now() + ".jpg";
  }
  await pipeline(
    req.file.stream,
    fs.createWriteStream(
      `${__dirname}/../client/public/uploads/posts/${fileName}`
    )
  );
  const { posterId, message, video, likers, comments } = req.body;
  if (!ObjectID.isValid(posterId)) {
    res.status(400).send({ error: "Invalid author id" });
    return;
  } else {
    try {
      UserModel.findById(posterId, (err, doc) => {
        if (err) {
          res.status(500).send(err);
        } else {
          const post = new PostModel({
            posterId,
            message,
            picture: req.file !== null ? "./uploads/posts/" + fileName : "",
            video,
            likers,
            comments,
          });
          post.save((err, doc) => {
            if (err) {
              res.status(500).send(err);
            } else {
              res.status(200).send({ post: doc });
            }
          });
        }
      });
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.getPostById = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findById(id, (err, doc) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send({ post: doc });
        }
      }).populate("posterId", "-password");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.updatePost = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findByIdAndUpdate(
        id,
        {
          $set: {
            message: req.body.message,
            video: req.body.video,
            likers: req.body.likers,
            comments: req.body.comments,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ post: doc });
          }
        }
      ).populate("posterId", "-password");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.deletePost = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findByIdAndDelete(id, (err, doc) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send({ post: doc, message: "Post deleted" });
        }
      }).populate("posterId", "-password");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.likePost = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findByIdAndUpdate(
        id,
        {
          $addToSet: { likers: req.body.likerId },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            console.log(doc);
          }
        }
      ).populate("posterId", "-password");
      UserModel.findByIdAndUpdate(
        req.body.likerId,
        {
          $addToSet: { likes: id },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ user: doc });
          }
        }
      );
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.unlikePost = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findByIdAndUpdate(
        id,
        {
          $pull: { likers: req.body.likerId },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            console.log(doc);
          }
        }
      ).populate("posterId", "-password");
      UserModel.findByIdAndUpdate(
        req.body.likerId,
        {
          $pull: { likes: id },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ user: doc });
          }
        }
      );
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.createComment = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findByIdAndUpdate(
        id,
        {
          $push: {
            comments: {
              commenterId: req.body.commenterId,
              commenterPseudo: req.body.commenterPseudo,
              comment: req.body.comment,
              timestamp: new Date().getTime(),
            },
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ comment: doc });
          }
        }
      ).populate("posterId", "-password");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.deleteComment = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findByIdAndUpdate(
        id,
        {
          $pull: {
            comments: {
              _id: req.body.commentId,
            },
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ comment: doc });
          }
        }
      ).populate("posterId", "-password");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.updateComment = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      PostModel.findById(id, (err, doc) => {
        if (err) {
          res.status(500).send(err);
        } else {
          const theComment = doc.comments.find((comment) => {
            return comment.id === req.body.commentId;
          });
          if (!theComment) {
            res.status(400).send({ error: "Comment not found" });
          }
          theComment.comment = req.body.comment;
          doc.save((err, doc) => {
            if (err) {
              res.status(500).send(err);
            } else {
              res.status(200).send({ comment: doc });
            }
          });
        }
      }).populate("posterId", "-password");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};
