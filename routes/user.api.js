const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");

const {
  getAll,
  createByEmailPassword,
  updateById,
  deleteById,
  loginWithEmailPassword,
  importantController,
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

module.exports = router;
