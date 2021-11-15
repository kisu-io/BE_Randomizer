const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    targetProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
