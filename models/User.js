const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const JWT_MY_SECRET = process.env.JWT_MY_SECRET;
const userSchema = Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    role: { type: String, enum: ["admin", "guest"], default: "guest" },
    currentBalance: { type: Number, default: 0 },
    avatar: String,
    // facebookId: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateToken = async function () {
  const accessToken = await jwt.sign({ _id: this._id }, JWT_MY_SECRET);
  return accessToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
