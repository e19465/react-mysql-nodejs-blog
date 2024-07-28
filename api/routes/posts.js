const router = require("express").Router();
const { postController } = require("../controllers");
const { verify_access_token } = require("../middleware/jwt_middleware");

//! Define routes for user endpoints
// 1. GET request for fetching all posts
router.get("/", postController.listPosts);

// 2. GET request for fetching one post
router.get("/:id", postController.getOnePost);

// 3.  POST request for create post
router.post("/", verify_access_token, postController.createPost);

// 4. PUT request for update post
router.put("/:id", verify_access_token, postController.updatePost);

// 5. DELETE request for delete a post
router.delete("/:id", verify_access_token, postController.deletPost);

module.exports = router;
