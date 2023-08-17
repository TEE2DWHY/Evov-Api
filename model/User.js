const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Name field cannot be empty"],
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: [true, "Password field cannot be empty"],
    minLength: [8, "Password cannot be less than eight"],
  },
});

module.exports = mongoose.model("User", UserSchema);
