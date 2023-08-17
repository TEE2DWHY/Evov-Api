const asyncWrapper = require("../middleware/asyncWrapper");
const User = require("../model/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { sendEmail, verifyEmailMessage } = require("../utils/email");
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
  res.status(StatusCodes.OK).json({
    msg: `Login successful`,
    token: token,
  });
});

module.exports = { register, verifyEmail, login };
