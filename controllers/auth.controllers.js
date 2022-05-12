const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const { signUpErrors, signInErrors } = require("../utils/errors.utils");

const createToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

module.exports.signUp = async (req, res) => {
  const { pseudo, email, password } = req.body;
  try {
    const user = await UserModel.create({ pseudo, email, password });
    res.status(201).send({ user });
  } catch (error) {
    const errors = signUpErrors(error);
    res.status(200).send({ errors });
  }
};

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.login(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    });
    res.status(200).send({ user: user._id });
  } catch (error) {
    const errors = signInErrors(error);
    res.status(400).send({ errors });
  }
};

module.exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).send({ message: "Logout success" });
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
};
