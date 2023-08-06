const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../model/user");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { sendEmail, verifyEmailMessage } = require("../utils/email");

const register = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Please provide email",
    });
  }

  try {
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_LIFETIME,
    });

    const newUser = await User.create({
      email: email,
    });

    await sendEmail({
      email: email,
      subject: "VERIFY YOUR EMAIL - EVOV",
      message: verifyEmailMessage(verificationToken),
    });

    res.status(StatusCodes.CREATED).json({
      msg: "Registration successful. Please check your email to verify.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "An error occurred during registration. Please try again later.",
    });
  }
});

const verifyEmail = asyncWrapper(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: `token not found or expired.`,
    });
  }
  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    const email = decodeToken.email;
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { isEmailVerified: true } },
      { new: true }
    );
    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Invalid registration token",
      });
    }
    res.status(StatusCodes.OK).json({
      msg: `${email} is now verified`,
    });
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.BAD_REQUEST).json({
      msg: `Invalid registration token`,
    });
  }
});

module.exports = { register, verifyEmail };
