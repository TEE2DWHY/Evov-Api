const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../model/user");
const { StatusCodes } = require("http-status-codes");

const register = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Please provide email",
    });
  }
  const newUser = await User.create({
    email: email,
  });
  res.status(StatusCodes.CREATED).json({
    user: newUser,
  });
});
module.exports = register;
