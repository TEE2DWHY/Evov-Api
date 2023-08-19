const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const {
  sendEmail,
  verifyEmailMessage,
  resetPasswordMessage,
} = require("../utils/email");
const bcrypt = require("bcrypt");

// register new user
const register = asyncWrapper(async (req, res) => {
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: "Password and confirm password does not match.",
    });
  }
  const verificationToken = jwt.sign(
    { email: req.body.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const newUser = await User.create({ ...req.body, password: hashedPassword });
  await sendEmail({
    email: req.body.email,
    subject: "VERIFY YOUR EMAIL - EVOV",
    message: verifyEmailMessage(verificationToken),
  });
  const firstName = req.body.fullName.split(" ")[0];
  res.status(StatusCodes.CREATED).json({
    firstName: firstName,
    msg: "Account is created. Please check your email to verify.",
  });
});

// verify user email after sign up
const verifyEmail = asyncWrapper(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: `Token not found.`,
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
      res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Invalid registration token",
      });
    }
    const redirectUrl = "https://evov.pages.dev/pages/success.html";
    res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    res.status(StatusCodes.UNAUTHORIZED).json({
      msg: `Invalid registration token`,
    });
  }
});

// login user
const login = asyncWrapper(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "User does not exist" });
  }
  if (!user.isEmailVerified) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: `Please verify email before login.`,
    });
  }
  const passwordMatch = await bcrypt.compare(req.body.password, user.password);
  if (!passwordMatch) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      msg: "Incorrect Password",
    });
  }
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });

  const firstName = user.fullName.split(" ")[0];

  res.status(StatusCodes.OK).json({
    msg: `Login successful`,
    token: token,
    firstName: firstName,
  });
});

// forgot password
const forgotPassword = asyncWrapper(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: `Please provide email`,
    });
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({
      msg: `User does not exist`,
    });
  }
  const resetPasswordToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
  await sendEmail({
    email: email,
    subject: "EVOV- RESET PASSWORD",
    message: resetPasswordMessage(resetPasswordToken),
  });
  res.status(StatusCodes.OK).json({
    msg: "Reset password email sent.",
  });
});

// reset password
const resetPassword = asyncWrapper(async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  const { token } = req.query;
  try {
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Invalid Token",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        msg: "Password and confirm password does not match.",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodeToken);
    const userId = decodeToken.userId;
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { password: hashedPassword } },
      { new: true }
    );
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        msg: "User not found.",
      });
    }
    res.status(StatusCodes.OK).json({
      msg: "Password reset is successful. Proceed to login.",
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        msg: "Invalid Token",
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "An error occurred with your request",
    });
  }
});

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
};
