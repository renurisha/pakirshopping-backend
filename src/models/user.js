const mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    min: 3,
    max: 20,
  },

  email: {
    type: String,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "admin",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
