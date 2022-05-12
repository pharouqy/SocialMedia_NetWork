const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).send({ users });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};

module.exports.getUserById = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      UserModel.findById(id, (err, doc) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send({ user: doc });
        }
      }).select("-password");
    } catch (error) {
      res.status(400).send(error);
      console.log(error);
    }
  }
};

module.exports.updateUser = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      UserModel.findByIdAndUpdate(
        id,
        {
          $set: {
            bio: req.body.bio,
          },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).send({ user: doc });
          }
        }
      ).select("-password");
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
};

module.exports.deleteUser = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      UserModel.findByIdAndDelete(id, (err, doc) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send({ user: doc, message: "User deleted" });
        }
      })
        .select("-password")
        .exec();
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
};

module.exports.followUser = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id) || !ObjectID.isValid(req.body.idToFollow)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      // add user to following array
      UserModel.findByIdAndUpdate(
        id,
        {
          $addToSet: {
            following: req.body.idToFollow,
          },
        },
        { new: true, upsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).json({ user: doc, message: "User followed" });
          }
        }
      );
      // add user to followers array
      UserModel.findByIdAndUpdate(
        req.body.idToFollow,
        {
          $addToSet: {
            followers: id,
          },
        },
        { new: true, upsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          }
        }
      );
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
};

module.exports.unfollowUser = (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id) || !ObjectID.isValid(req.body.idToUnFollow)) {
    res.status(400).send({ error: "Invalid id" });
    return;
  } else {
    try {
      // remove user from following array
      UserModel.findByIdAndUpdate(
        id,
        {
          $pull: {
            following: req.body.idToUnFollow,
          },
        },
        { new: true, upsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          } else {
            res.status(200).json({ user: doc, message: "User unfollowed" });
          }
        }
      );
      // remove user from followers array
      UserModel.findByIdAndUpdate(
        req.body.idToUnFollow,
        {
          $pull: {
            followers: id,
          },
        },
        { new: true, upsert: true },
        (err, doc) => {
          if (err) {
            res.status(500).send(err);
          }
        }
      );
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
};
