const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },
    ratings: [
      {
        author: { type: Schema.Types.ObjectId, ref: "User" },
        rate: { type: Number, enum: [1, 2, 3, 4, 5] },
      },
    ],
    averageRate: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
