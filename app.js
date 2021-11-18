require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const indexRouter = require("./routes/index");
const sendResponse = require("./helpers/sendResponse");
const session = require("express-session");
const app = express();
const passport = require("passport");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./helpers/passport.helper");
// Mongo connect
require("./mongo");

app.use("/api", indexRouter);

/** when request match no ruote, create error */
app.use((req, res, next) => {
  const error = new Error("Wrong url");
  error.statusCode = 404;
  next(error);
});

/** when next(error) called,
 * this function will send error message */
app.use((err, req, res, next) => {
  if (err.statusCode) {
    return sendResponse(res, err.statusCode, false, null, true, "Url not found");
  } else {
    return sendResponse(res, 500, false, null, err.message, "Internal Server Error");
  }
});

module.exports = app;
