const mongoose = require("mongoose");
const fakeProduct = require("./createProduct");
const fakeUser = require("./createUser");
mongoose.Promise = global.Promise;
const fakeCart = require("./createCart");
const { createTemplateIfNotExists } = require("./helpers/email.helper");
// Connect MongoDB at default port 27017.
mongoose.connect(
  "mongodb://localhost:27017/panther",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log("MongoDB Connection Succeeded.");
      createTemplateIfNotExists();
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);
