const Cart = require("../models/Cart");

const Product = require("../models/Product");
const sendResponse = require("../helpers/sendResponse");
const User = require("../models/User");
const cartController = {};

cartController.createCart = async (req, res, next) => {
  //create a cart with the first product
  let test;
  let result;
  try {
    //get inputs
    const owner = req.currentUser._id;
    const { productId } = req.params;
    let { qty } = req.body;
    qty = parseInt(qty);
    //check if input is enough
    if (!productId || typeof qty !== "number") {
      throw new Error("Missing info");
    }
    //check if qty is a positive number
    if (qty < 0) {
      throw new Error("qty invalid");
    }
    //check if user already have a cart active
    const activeCart = await Cart.findOne({ owner, status: "active" });
    if (activeCart) throw new Error("already have active cart");
    //check if product id is true
    const found = await Product.findById(productId);
    if (!found) {
      throw new Error("product not found");
    }
    //create product choice object
    const productChoice = { productId, qty };
    //create new cart object to be add to db
    const newCart = {
      owner,
      products: [productChoice],
    };
    //create new cart in model
    result = await Cart.create(newCart);
    //get info from owner-User ref  and products.productId-Product ref
    result = await result.populate([
      { path: "owner", select: ["name", "email"] },
      { path: "products.productId", select: "name" },
    ]);
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

cartController.addProductToCart = async (req, res, next) => {
  //INPUT: owner, productId and qty
  //Operation: find active cart => push new product to found
  // => Find by id and update by found
  const owner = req.currentUser._id; //safe
  const body = req.body;

  let result; //safe

  try {
    const cartToUpdate = await Cart.findOne({ owner, status: "active" });

    body.map((product) => {
      const qty = parseInt(product.qty); //check
      const productId = product.productId; //check
      //check if valid in here
      cartToUpdate.products.push({ productId, qty });
    });
    result = await Cart.findByIdAndUpdate(cartToUpdate._id, cartToUpdate, {
      new: true,
    });
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    body,
    false,
    "Successfully create shopping cart"
  );
};

cartController.removeProductFromCart = async (req, res, next) => {
  let result;
  const { cartId } = req.params;
  let { productId, qty } = req.body;
  // productId = new mongoose.Types.ObjectId(productId);

  try {
    const cartFound = await Cart.findById(cartId);
    // const newProductsList = cartFound.products
    //   .map((existed) => {
    //     const newProduct = {
    //       productId: existed.productId,
    //       qty: existed.productId.equals(productId)
    //         ? existed.qty - qty
    //         : existed.qty,
    //     };
    //     return newProduct;
    //   })
    //   .filter((e) => e.qty > 0);

    const newProductsList = cartFound.products.filter((existed) => {
      if (existed.productId.equals(productId)) {
        existed.qty -= qty;
      }
      return existed.qty > 0;
    });
    cartFound.products = newProductsList;
    result = await Cart.findByIdAndUpdate(cartId, cartFound, { new: true });
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create shopping cart"
  );
};

cartController.getSingleCart = async (req, res, next) => {
  let result;
  const { cartId } = req.query;
  const owner = req.currentUser._id;

  try {
    console.log(owner, cartId);
    result = await Cart.findOne({ owner, _id: cartId }).populate(
      "products.productId"
    );
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully get single shopping cart"
  );
};

cartController.getAll = async (req, res, next) => {
  let result = {};
  //pagination
  try {
    result.carts = await Cart.find({}).populate([
      "owner",
      "products.productId",
    ]);
    result.count = result.carts.length;
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully get all cart"
  );
};

cartController.getAllOwn = async (req, res, next) => {
  let result = {};
  //pagination
  let owner = req.currentUser._id;
  try {
    result.carts = await Cart.find({ owner }).populate("products.productId");
    result.count = result.carts.length;
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully get all cart"
  );
};
cartController.payCart = async (req, res, next) => {
  let result = {};
  const { cartId } = req.params;

  const { currentBalance, _id } = req.currentUser;

  try {
    let found = await Cart.findById(cartId).populate("products.productId");

    const productsToUpdate = await Promise.all(
      found.products.map(async (request) => {
        const existed = await Product.findById(request.productId._id);
        let newStock = existed.stock;
        if (request.qty <= existed.stock) {
          newStock = existed.stock - request.qty;
        } else {
          console.log(
            "Sold out",
            request.productId.name,
            request.qty,
            existed.stock
          );
          throw new Error("Sold out product");
        }

        return { _id: existed._id, newStock };
      })
    );

    const total = found.products.reduce(
      (acc, cur) => acc + cur.qty * cur.productId.price,
      0
    );
    if (found.status === "paid")
      throw new Error("cart already pay, but i would appricate the charity");

    if (total > currentBalance) throw new Error("404 - Money not found");
    const newBalance = currentBalance - total;
    result.cart = await Cart.findByIdAndUpdate(
      cartId,
      { status: "paid" },
      { new: true }
    );
    const user = await User.findByIdAndUpdate(
      _id,
      { currentBalance: newBalance },
      { new: true }
    );
    result.currentBalance = user.currentBalance;

    //update the stock
    await Promise.all(
      productsToUpdate.map(async (product) => {
        await Product.findByIdAndUpdate(product._id, {
          stock: product.newStock,
        });
      })
    );
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully  pay for cart shopping cart"
  );
};

cartController.deleteCart = async (req, res, next) => {
  let result;
  const { cartId } = req.params;
  const owner = req.currentUser._id;
  try {
    result = await Cart.findOneAndUpdate(
      { _id: cartId, owner },
      { isDeleted: true },
      {
        new: true,
      }
    );
  } catch (error) {
    return next(error);
  }
  return sendResponse(res, 200, true, null, false, "Successfully delete cart");
};

module.exports = cartController;
