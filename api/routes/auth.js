const router = require("express").Router();
const { authController } = require("../controllers");
const { verify_refresh_token } = require("../middleware/jwt_middleware");

//! Define Routes
// 1. Login
router.post("/login", authController.login);

// 2. Refresh Tokens
router.post("/refresh", verify_refresh_token, authController.refreshTokens);

// 3. Logout
router.post("/logout", authController.logout);

module.exports = router;
