const router = require("express").Router();
const register = require("../controllers/user");

router.route("/register").post(register);

module.exports = router;
