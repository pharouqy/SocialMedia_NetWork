const router = require("express").Router();
const postControllers = require("../controllers/post.controllers");
const multer = require("multer");
const upload = multer();

router.get("/", postControllers.getAllPosts);
router.post("/", upload.single("file"), postControllers.createPost);
router.get("/:id", postControllers.getPostById);
router.put("/:id", postControllers.updatePost);
router.delete("/:id", postControllers.deletePost);

router.patch("/like/:id", postControllers.likePost);
router.patch("/unlike/:id", postControllers.unlikePost);

router.patch("/comment/:id", postControllers.createComment);
router.patch("/comment-delete/:id", postControllers.deleteComment);
router.patch("/comment-update/:id", postControllers.updateComment);

module.exports = router;
