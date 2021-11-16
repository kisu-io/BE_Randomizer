const faker = require("faker");
const Cart = require("./models/Cart");
const Product = require("./models/Product");
const User = require("./models/User");

const createCart = async () => {
  //delete old cart
  const deletePrevLog = await Cart.collection.drop();
  //get all users
  const allUser = await User.find({ isDeleted: false });
  //get all product
  const allProduct = await Product.find({ isDeleted: false });
  allUser.map(async (user) => {
    let randomProducts = [];
    allProduct.forEach((e) => {
      let qty = Math.ceil(Math.random() * 10);
      const number = Math.floor(Math.random() * 2);
      if (number === 0) {
        randomProducts.push({
          productId: e._id,
          qty: qty,
        });
      }
    });
    //create cart
    const singleCart = {
      owner: user._id,
      status: "active",
      products: randomProducts,
    };
    //find existed cart
    let found;
    if (!found) {
      found = await Cart.create(singleCart);
      found = await found.populate("products.productId");
    }
    console.log("created this cart", found);
    console.log("=====================");
    // Payment
    //geting THIS ITERATION's user information

    const { currentBalance, _id } = user;
    // this cart id
    const cartId = found._id;
    // contruct a list of product qty to update

    const productsToUpdate = await Promise.all(
      found.products.map(async (request) => {
        //check the requesting id availability with existing stock
        const existed = await Product.findById(request.productId._id);
        //set initial stock = existed stock
        let newStock = existed.stock;
        if (request.qty <= existed.stock) {
          //reassign newstock with value of existed - request
          newStock = existed.stock - request.qty;
        } else {
          console.log(
            "Sold out Cant not change",
            request.productId.name,
            request.qty,
            existed.stock
          );
        }
        return { _id: existed._id, newStock };
      })
    );

    // Balance Check
    const total = found.products.reduce(
      (acc, cur) => acc + cur.qty * cur.productId.price,
      0
    );

    let newBalance = currentBalance;
    if (total <= currentBalance) {
      //if total < currentBalance , chagne the cart status to paid, and update User fund, update stock
      newBalance = currentBalance - total;

      await Cart.findByIdAndUpdate(cartId, { status: "paid" }, { new: true });

      await User.findByIdAndUpdate(
        _id,
        { currentBalance: newBalance },
        { new: true }
      );

      await Promise.all(
        productsToUpdate.map(async (product) => {
          await Product.findByIdAndUpdate(product._id, {
            stock: product.newStock,
          });
        })
      );
      console.log("PAID", cartId);
      console.log("===============");
    } else {
      console.log("no money");
      console.log("===============");
    }
  });
};

module.exports = createCart;
