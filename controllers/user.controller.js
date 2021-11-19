const sendResponse = require("../helpers/sendResponse");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const { uploader } = require("../helpers/uploadHelper");
const { createSingleEmailFromTemplate, send } = require("../helpers/email.helper");
const generateHex = require("../helpers/generateHex");
const userController = {};
const SALT_ROUND = parseInt(process.env.SALT_ROUND);

userController.getAll = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;
  let result;
  let count = 0;
  try {
    result = await User.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    count = result.length;
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    { result, count },
    false,
    "Successfully get all users"
  );
};
userController.createByEmailPassword = async (req, res, next) => {
  const { name, email } = req.body;
  let { password } = req.body;
  let result;
  try {
    if (!name || !email || !password) throw new Error("missing input");
    const found = await User.findOne({ email });
    if (found) throw new Error("email already reg");
    //encrypting password
    const salt = await bcrypt.genSalt(SALT_ROUND);
    password = await bcrypt.hash(password, salt);
    let code = await generateHex(12);
    let link = `http://localhost:5000/api/users/emailverification/${code}`;
    result = await User.create({
      name,
      email,
      password,
      emailVerificationCode: code,
    });

    // send email verification email
    const content = {
      name,
      link,
    };
    let toEmail = email;
    let template_key = "verify_email";
    const info = await createSingleEmailFromTemplate(template_key, content, toEmail);
    await send(info);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create user, check your email for verification"
  );
};
userController.loginWithEmailPassword = async (req, res, next) => {
  const { email, password } = req.body;
  let result;
  try {
    if (!email || !password) throw new Error("Please input email and pass");
    const user = await User.findOne({ email, isDeleted: false });
    if (!user) throw new Error("User with the email is not found");
    let isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      result = await user.generateToken();
    } else {
      throw new Error("Password not match");
    }
  } catch (error) {
    return next(error);
  }
  return sendResponse(res, 200, true, result, false, "Successfully login user");
};
userController.updateById = async (req, res, next) => {
  let result;
  const allowOptions = ["name", "email"];
  const updateObject = {};
  const imagePath = req.file.path;
  let imageResult;
  const filePath = req.file.path;
  try {
    allowOptions.forEach((option) => {
      if (req.body[option] !== undefined) {
        updateObject[option] = req.body[option];
      }
    });
    if (imagePath) {
      const cloudinaryResponse = await uploader.upload(imagePath);
      updateObject.avatar = cloudinaryResponse.secure_url;
    }

    if (filePath) {
      imageResult = await uploader.upload(filePath);
      updateObject.avatar = imageResult.secure_url;
    }
    result = await User.findByIdAndUpdate(req.currentUser._id, updateObject, {
      new: true,
    });
  } catch (error) {
    return next(error);
  }
  return sendResponse(res, 200, true, result, false, "Successfully update user");
};
userController.deleteById = async (req, res, next) => {
  //soft delete
  try {
    await User.findByIdAndUpdate(req.currentUser._id, {
      isDeleted: true,
    });
  } catch (error) {
    return next(error);
  }
  return sendResponse(res, 200, true, null, false, "Successfully delete user");
};
userController.createWithGoogle = async (req, res, next) => {
  const userInfo = req.user;
  let result;
  // allow user to create account with google sign
  // from userInfo input, create an account in the database with
  try {
    const found = await User.findOne({ email: userInfo.emails[0].value });
    if (found) throw new Error("User already registered");
    const salt = await bcrypt.genSalt(SALT_ROUND);
    let password = await bcrypt.hash("abc", salt);

    const newUser = {
      name: userInfo.displayName,
      avatar: userInfo.photos[0].value,
      email: userInfo.emails[0].value,
      password,
    };
    result = await User.create(newUser);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create account with Google"
  );
};
userController.createWithFacebook = async (req, res, next) => {
  const userInfo = req.user;

  let result;
  // allow user to create account with google sign
  // from userInfo input, create an account in the database with
  try {
    const found = await User.findOne({ email: userInfo.emails[0].value });
    console.log("haha", found);
    if (found) throw new Error("User already registered");
    const salt = await bcrypt.genSalt(SALT_ROUND);
    let password = await bcrypt.hash("abc", salt);

    const newUser = {
      name: userInfo.displayName,
      email: userInfo.emails[0].value,
      facebookId: userInfo.id,
      password,
    };
    result = await User.create(newUser);
    console.log(result);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create account with Facebook"
  );
};
userController.verifyEmail = async (req, res, next) => {
  let result;
  try {
    const emailVerificationCode = req.params.code;
    const found = await User.findOne({ emailVerificationCode });
    if (!found) throw new Error("Not Found Email");
    await User.findOneAndUpdate({ email: found.email }, { isEmailVerified: true });
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create account with Facebook"
  );
};
userController.forgotPassword = async (req, res, next) => {
  const { email, code } = req.body;
  try {
    if (!email) new Error("Not Found Email");
    if (!code) new Error("Invalid code");
    const found = await User.findOne({ email, resetPassword: code });
    // const salt = await bcrypt.genSalt(SALT_ROUND);
    // password = await bcrypt.hash(password, salt);
    const password = "abc123";
    const salt = await bcrypt.genSalt(SALT_ROUND);
    const saltedPassword = await bcrypt.hash(password, salt);
    await User.findOneAndUpdate(
      { email: found.email },
      { password: saltedPassword }
    );

    // Gửi mail mới thông báo reset password
  } catch (error) {
    return next(error);
  }
};

userController.createResetPasswordEmail = async (req, res, next) => {
  const { name, email } = req.params;
  let result;
  try {
    if (!name || !email) throw new Error("missing input");
    const found = await User.findOne({ email });
    if (!found) throw new Error("User not found");
    //encrypting password
    // const salt = await bcrypt.genSalt(SALT_ROUND);
    // password = await bcrypt.hash(password, salt);
    let code = await generateHex(12);
    // let link = `http://localhost:5000/api/users/emailverification/${code}`;
    let link = `http://localhost:5000/api/users/resetPassword/${code}`;
    result = await User.findOneAndUpdate(
      {
        name,
        email,
      },
      { resetPassword: code }
    );

    // send email verification email
    const content = {
      name,
      link,
    };
    let toEmail = email;
    let template_key = "verify_email";
    const info = await createSingleEmailFromTemplate(template_key, content, toEmail);
    await send(info);
  } catch (error) {
    return next(error);
  }
  return sendResponse(
    res,
    200,
    true,
    result,
    false,
    "Successfully create user, check your email for verification"
  );
};
module.exports = userController;
