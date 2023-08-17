const router = require("express").Router();
const { register, verifyEmail, login } = require("../controllers/auth");

router.route("/register").post(register);
router.route("/verify-email").get(verifyEmail);
router.route("/login").post(login);

module.exports = router;
