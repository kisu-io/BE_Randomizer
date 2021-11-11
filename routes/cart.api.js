const express = require("express");
const sendResponse = require("../helpers/sendResponse");

const authenticationMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const Cart = require("../models/Cart");
const User = require("../models/User");
const router = express.Router();

const createCart = async (req, res, next) => {
  //create a cart with the first product
  const owner = req.currentUser._id;
  const { productId } = req.params;
  let { qty } = req.body;
  let test;
  qty = parseInt(qty);
  let result;
  //check WCGW
  const productChoice = { productId, qty };

  const newCart = {
    owner,
    products: [productChoice],
  };

  try {
    result = await Cart.create(newCart);
    test = await User.findById(result.owner);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    { result, test },
    false,
    "Successfully create shopping cart"
  );
};

/**
 * Description: Update product
 * Access : admin role required
 */
router.post("/:productId", authenticationMiddleware, createCart);

module.exports = router;