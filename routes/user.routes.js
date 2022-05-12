const router = require("express").Router();
const authControllers = require("../controllers/auth.controllers");
const userControllers = require("../controllers/user.controllers");
const uploadControllers = require("../controllers/upload.controllers");
const multer = require("multer");
const upload = multer();

router.post("/register", authControllers.signUp);
router.post("/login", authControllers.signIn);
router.get("/logout", authControllers.logout);

router.get("/", userControllers.getAllUsers);
router.get("/:id", userControllers.getUserById);
router.put("/:id", userControllers.updateUser);
router.delete("/:id", userControllers.deleteUser);
router.patch("/follow/:id", userControllers.followUser);
router.patch("/unfollow/:id", userControllers.unfollowUser);

router.post("/upload", upload.single("file"), uploadControllers.uploadImage);

module.exports = router;
