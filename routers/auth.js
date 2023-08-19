const router = require("express").Router();
const {
  register,
  verifyEmail,
  login,
  resetPassword,
  forgotPassword,
} = require("../controllers/auth");

router.route("/register").post(register);
router.route("/verify-email").get(verifyEmail);
router.route("/login").post(login);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

module.exports = router;
