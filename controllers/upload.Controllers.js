const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const fs = require("fs");
const { promisify } = require("util");
const pipeline = promisify(require("stream").pipeline);

module.exports.uploadImage = async (req, res) => {
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
  const fileName =
    req.body.pseudo + "." + req.file.detectedMimeType.split("/")[1];
  await pipeline(
    req.file.stream,
    fs.createWriteStream(
      `${__dirname}/../client/public/uploads/profil/${fileName}`
    )
  );
  try {
    UserModel.findByIdAndUpdate(
      req.body.userId,
      {
        $set: {
          picture: `./uploads/profil/${fileName}`,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, doc) => {
        if (err) {
          res.status(500).send(err);
        } else {
          res.status(200).send(doc);
        }
      }
    );
  } catch (error) {
    res.status(500).send(error);
  }
};
