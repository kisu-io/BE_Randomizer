const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const MONGO_URI = process.env.MONGO_URI;
const { createTemplateIfNotExists } = require("./helpers/email.helper");
// Connect MongoDB at default port 27017.
mongoose.connect(
  MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (!err) {
      console.log("MongoDB Atlas Connection Succeeded.");
      createTemplateIfNotExists();
    } else {
      console.log("Error in DB connection: " + err);
    }
  }
);
