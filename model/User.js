const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please provide email"],
    unique: true,
  },
});

module.exports = mongoose.model("user", UserSchema);
