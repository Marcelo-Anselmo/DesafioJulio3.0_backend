const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  following: {
    type: String,
    required: "",
  },
});

const User = mongoose.model("User", userSchema);
module.exports = { User };