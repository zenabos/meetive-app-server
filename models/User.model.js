const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: { 
      type: String,
      unique: true,
      required: true,
    },
    password: String,
    required: true,

  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
