const monngoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new monngoose.Schema(
  {
    pseudo: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 55,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      validate: [isEmail],
      minlength: 5,
      maxlength: 255,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dzqbzqgjw/image/upload/v1598424851/default_profile_picture_qxqjqz.png",
    },
    bio: {
      type: String,
      maxlength: 1024,
      trim: true,
    },
    followers: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },
    likes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  console.log(password, user.password);
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Wrong password");
  }
  return user;
};

module.exports = monngoose.model("User", UserSchema);
