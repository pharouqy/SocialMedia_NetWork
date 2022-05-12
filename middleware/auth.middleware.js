const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).send({ error: "You are not logged in" });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      res.status(401).send({ error: "You are not logged in" });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: "You are not logged in" });
  }
};

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        res.status(401).send({ error: "You are not logged in" });
        return;
      }
      res.status(200).send({ user: decoded.id });
    });
  } else {
    res.status(401).send({ error: "You are not logged in" });
  }
};
