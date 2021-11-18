const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const passport = require("passport");

const {
  getAll,
  createByEmailPassword,
  updateById,
  deleteById,
  loginWithEmailPassword,
  createWithGoogle,
  createWithFacebook,
} = require("../controllers/user.controller");
const imageUploadMiddleware = require("../middlewares/imageUpload.middleware");
/**
 * Description:  get all edas
 * Access : admin role required
 */
router.get("/", getAll);
/**
 * Description:  destroy the world
 * Access : public
 */
router.post("/", createByEmailPassword);

/**
 * Description:  destroy the world
 * Access : admin role required
 */
router.post("/login", loginWithEmailPassword);

/**
 * Description:  destroy the world
 * Access : authenticated user
 */
router.put(
  "/update-me",
  authenticationMiddleware,
  imageUploadMiddleware.single("avatar"),
  updateById
);
/**
 * Description:  destroy the world
 * Access : authenticated user
 */
router.delete("/delete-me", authenticationMiddleware, deleteById);

router.get(
  "/loginwithgoogle",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/login/googleok",
  passport.authenticate("google", { failureRedirect: "/notFound" }),
  createWithGoogle
);

router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/login/facebookok",
  passport.authenticate("facebook", {
    failureMessage: "Cannot login to facebook",
    failureRedirect: "/notFound",
  }),
  createWithFacebook
);
module.exports = router;
