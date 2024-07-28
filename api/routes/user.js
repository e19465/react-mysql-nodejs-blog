const router = require("express").Router();
const { userController } = require("../controllers");
const {
  verify_access_token_and_paramsId_with_tokenId,
} = require("../middleware/jwt_middleware");

//! Define routes for user endpoints
// 1. GET request for fetching all users
router.get("/all", userController.listUsers);

// 2. GET request for fetching a single user
router.get(
  "/:id",
  verify_access_token_and_paramsId_with_tokenId,
  userController.getUser
);

// 3. POST request for creating a new user
router.post("/register", userController.createUser);

// 4. PUT request for updating user details
router.put(
  "/:id",
  verify_access_token_and_paramsId_with_tokenId,
  userController.updateUserDetails
);

// 5. PUT request for updating user password
router.put(
  "/:id/password",
  verify_access_token_and_paramsId_with_tokenId,
  userController.updateUserPassword
);

// 6. DELETE request for deleting a user
router.delete(
  "/:id",
  verify_access_token_and_paramsId_with_tokenId,
  userController.deleteUser
);

module.exports = router;
