const express = require("express");
const {
  createProduct,
  getAllProduct,
  updateProduct,
  getSingleProduct,
  deleteProduct,
  rateProduct,
} = require("../controllers/product.controller");
const authenticationMiddleware = require("../middlewares/auth.middleware");
const isAdmin = require("../middlewares/isAdmin.middleware");
const router = express.Router();

/**
 * Description: Get all product
 * Access : public
 */
router.get("/", getAllProduct);
/**
 * Description: Get single product by id
 * Access : public
 */

router.get("/:productId", getSingleProduct);
/**
 * Description:  Create product
 * Access : Admin require
 */
router.post("/", authenticationMiddleware, isAdmin, createProduct);

/**
 * Description: Update product
 * Access : admin role required
 */
router.put("/:productId", authenticationMiddleware, isAdmin, updateProduct);

/**
 * Description: Update product
 * Access : admin role required
 */
router.put("/:productId/rate", authenticationMiddleware, rateProduct);

/**
 * Description: Delete product
 * Access : authenticated user
 */
router.delete("/:productId", authenticationMiddleware, isAdmin, deleteProduct);

module.exports = router;
