module.exports.signUpErrors = (err) => {
  let errors = { psuedo: "", email: "", password: "" };
  if (err.message.includes("psuedo")) {
    errors.psuedo = "Pseudo already exist";
  }
  if (err.message.includes("email")) {
    errors.email = "Email already exist";
  }
  if (err.message.includes("password")) {
    errors.password = "Password must be at least 6 characters";
  }
  if (err.code === 11000 && Object.keys(err)[0] === "email") {
    errors.email = "Email already exist";
  }
  if (err.code === 11000 && Object.keys(err)[0] === "psuedo") {
    errors.psuedo = "Pseudo already exist";
  }
  return errors;
};

module.exports.signInErrors = (err) => {
  let errors = { email: "", password: "" };
  if (err.message.includes("email")) {
    errors.email = "Email not found";
  }
  if (err.message.includes("password")) {
    errors.password = "Password is incorrect";
  }
  return errors;
};

module.exports.uploadErrors = (err) => {
  let errors = { format: "", maxSize: "" };

  if (err.message.includes("invalid file"))
    errors.format = "Format incompatibile";

  if (err.message.includes("max size"))
    errors.maxSize = "Le fichier dépasse 1000ko";

  return errors;
};
