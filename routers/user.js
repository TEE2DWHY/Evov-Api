const router = require("express").Router();
const { register, verifyEmail } = require("../controllers/user");

router.route("/register").post(register);
router.route("/verify-email").get(verifyEmail);

module.exports = router;
