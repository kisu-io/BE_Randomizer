const faker = require("faker");
const Product = require("./models/Product");
const numberOfProduct = 10;

const createProduct = async () => {
  // console.log("Creating some products");
  const deletePrevLog = await Product.collection.drop();
  for (let index = 0; index < numberOfProduct; index++) {
    const singleProduct = {
      name: faker.commerce.product(),
      price: parseInt(faker.commerce.price()),
      stock: Math.ceil(Math.random() * 100),
    };

    const found = await Product.findOne({ name: singleProduct.name });
    if (!found) {
      const created = await Product.create(singleProduct);
      console.log(
        `Created ${created.name} price ${created.price} qty ${created.stock}`
      );
    } else {
      console.log("Found same product name", found.name);
    }
  }
  console.log("Create Product Successfully");
  console.log("===========================");
};

module.exports = createProduct;
